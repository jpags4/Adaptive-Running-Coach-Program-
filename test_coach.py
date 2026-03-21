import unittest
from datetime import date
from unittest import mock

from app import (
    _activity_key,
    _activity_notes_context,
    _apply_clarification_answers_to_settings,
    _attach_activity_notes,
    _generate_weekly_plan,
    _current_day_status,
    _pace_text_for_type,
    _profile_settings_payload,
    _recommendation_training_context,
    build_training_roadmap,
    calendar_days,
    projected_calendar_entries,
)
from storage import load_tokens
from coach import (
    AthleteProfile,
    Recommendation,
    RecoveryMetrics,
    Run,
    assess_recommendation_uncertainty,
    build_pace_model,
    build_recommendation_options,
    build_weekly_intent,
    coach_recommendation,
)
from integrations import (
    build_strava_authorize_url,
    build_whoop_authorize_url,
    strava_activity_preview,
    strava_runs_to_model,
    whoop_workout_preview,
)
from llm_coach import _apply_guardrails, _finalize_daily_adaptation, llm_recommendation
from sample_data import SAMPLE_METRICS, SAMPLE_PROFILE, SAMPLE_RUNS


class CoachRecommendationTests(unittest.TestCase):
    def test_returns_easy_day_for_post_workout_sample(self) -> None:
        recommendation = coach_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 14),
        )

        self.assertEqual(recommendation.workout, "Easy aerobic run")
        self.assertEqual(recommendation.duration_minutes, 45)
        self.assertIn("aerobic support day", " ".join(recommendation.explanation))

    def test_builds_strava_authorize_url(self) -> None:
        url = build_strava_authorize_url("12345", "https://coach.example.com", "abc123state")
        self.assertIn("client_id=12345", url)
        self.assertIn("redirect_uri=https%3A%2F%2Fcoach.example.com%2Fstrava%2Fcallback", url)
        self.assertIn("response_type=code", url)
        self.assertIn("state=abc123state", url)

    def test_builds_whoop_authorize_url(self) -> None:
        url = build_whoop_authorize_url("whoop-client", "https://demo.ngrok-free.dev", "whoopstate")
        self.assertIn("client_id=whoop-client", url)
        self.assertIn("redirect_uri=https%3A%2F%2Fdemo.ngrok-free.dev%2Fwhoop%2Fcallback", url)
        self.assertIn("state=whoopstate", url)

    def test_strava_run_filters_tiny_duplicate_run_on_same_day(self) -> None:
        activities = [
            {
                "type": "Run",
                "sport_type": "Run",
                "start_date_local": "2026-03-19T07:30:00Z",
                "distance": 1609.34,
                "moving_time": 600,
                "name": "Morning Run",
            },
            {
                "type": "Run",
                "sport_type": "Run",
                "start_date_local": "2026-03-19T18:00:00Z",
                "distance": 160.934,
                "moving_time": 60,
                "name": "GPS Blip",
            },
        ]

        runs = strava_runs_to_model(activities)
        preview = strava_activity_preview(activities)

        self.assertEqual(len(runs), 1)
        self.assertEqual(runs[0].distance_miles, 1.0)
        self.assertEqual(len(preview), 1)
        self.assertEqual(preview[0]["distance_miles"], 1.0)

    def test_strava_run_filters_whoop_synced_run(self) -> None:
        activities = [
            {
                "type": "Run",
                "sport_type": "Run",
                "start_date_local": "2026-03-19T07:30:00Z",
                "distance": 6437.36,
                "moving_time": 2400,
                "name": "Morning Run",
            },
            {
                "type": "Run",
                "sport_type": "Run",
                "start_date_local": "2026-03-19T18:00:00Z",
                "distance": 160.934,
                "moving_time": 60,
                "name": "WHOOP Run",
                "device_name": "WHOOP",
            },
        ]

        runs = strava_runs_to_model(activities)
        preview = strava_activity_preview(activities)

        self.assertEqual(len(runs), 1)
        self.assertEqual(runs[0].distance_miles, 4.0)
        self.assertEqual(len(preview), 1)
        self.assertEqual(preview[0]["distance_miles"], 4.0)

    def test_strava_fast_5k_effort_is_marked_hard_in_preview(self) -> None:
        activities = [
            {
                "type": "Run",
                "sport_type": "Run",
                "start_date_local": "2026-03-18T07:30:00Z",
                "distance": 5310.0,
                "moving_time": 1458,
                "name": "Morning Run",
            }
        ]

        preview = strava_activity_preview(activities)

        self.assertEqual(len(preview), 1)
        self.assertEqual(preview[0]["intensity"], "hard")

    @mock.patch.dict("os.environ", {"APP_TIMEZONE": "America/New_York"}, clear=False)
    def test_whoop_workout_preview_uses_local_timezone_for_day(self) -> None:
        snapshot = {
            "workouts": {
                "records": [
                    {
                        "start": "2026-03-21T00:30:00Z",
                        "end": "2026-03-21T01:15:00Z",
                        "sport_name": "Weightlifting",
                        "score": {"strain": 8.2},
                    }
                ]
            }
        }

        preview = whoop_workout_preview(snapshot)

        self.assertEqual(len(preview), 1)
        self.assertEqual(preview[0]["day"], "2026-03-20")

    def test_calendar_days_keeps_projected_run_with_recorded_future_strength(self) -> None:
        recommendation = Recommendation(
            date="2026-03-19",
            workout="Easy aerobic run",
            intensity="easy",
            duration_minutes=45,
            run_distance_miles=4.0,
            run_pace_guidance="9:15-9:45/mi",
            lift_focus="Single-Leg Strength + Glutes",
            lift_guidance="Keep strength short and secondary.",
            recap=[],
            explanation=[],
            explanation_sections={},
            warnings=[],
            confidence="high",
            weekly_intent={"week_type": "steady", "mileage_target": 28, "primary_adaptation": "volume"},
        )

        weekly_plan = {
            "2026-03-20": [
                {
                    "source": "Projection",
                    "name": "Run",
                    "day": "2026-03-20",
                    "sport": "Projected Run",
                    "distance_miles": 4.2,
                    "duration_minutes": 40,
                    "average_pace_min_per_mile": 0,
                    "pace_text": "9:15-9:45/mi",
                    "intensity": "easy",
                    "projected": True,
                }
            ]
        }
        activity_feed = [
            {
                "source": "WHOOP",
                "name": "Weightlifting",
                "day": "2026-03-20",
                "sport": "Weightlifting",
                "distance_miles": 0,
                "duration_minutes": 35,
                "average_pace_min_per_mile": 0,
                "strain": 8.4,
            }
        ]

        cards = calendar_days(
            activity_feed=activity_feed,
            metrics=SAMPLE_METRICS,
            recommendation=recommendation,
            today="2026-03-19",
            profile=SAMPLE_PROFILE,
            weekly_plan=weekly_plan,
        )

        friday = next(card for card in cards if card["day"] == "2026-03-20")
        self.assertEqual(len(friday["activities"]), 2)
        self.assertTrue(any(activity.get("name") == "Run" for activity in friday["activities"]))
        self.assertTrue(any(activity.get("name") == "Weightlifting" for activity in friday["activities"]))

    def test_attach_activity_notes_annotates_activity(self) -> None:
        activity = {
            "source": "Strava",
            "name": "Run",
            "day": "2026-03-19",
            "sport": "Run",
            "distance_miles": 4.0,
            "duration_minutes": 31,
        }
        activity_key = _activity_key(activity)

        annotated = _attach_activity_notes([activity], {activity_key: {"note": "Felt smooth until the last mile."}})

        self.assertEqual(annotated[0]["activity_key"], activity_key)
        self.assertEqual(annotated[0]["note"], "Felt smooth until the last mile.")

    def test_activity_notes_context_includes_recent_noted_workouts(self) -> None:
        context = _activity_notes_context(
            {
                "runs": [
                    {
                        "day": "2026-03-19",
                        "name": "Run",
                        "distance_miles": 4.0,
                        "duration_minutes": 31,
                        "note": "Fast finish and a little calf tightness.",
                    }
                ],
                "strength": [
                    {
                        "day": "2026-03-18",
                        "name": "Weightlifting",
                        "duration_minutes": 38,
                        "note": "Left hip felt better after warm-up.",
                    }
                ],
            }
        )

        self.assertIn("2026-03-19 Run (4.0 mi, 31 min): Fast finish", context)
        self.assertIn("2026-03-18 Weightlifting (38 min): Left hip felt better", context)

    def test_activity_notes_context_excludes_stale_notes_from_model_prompt(self) -> None:
        context = _activity_notes_context(
            {
                "runs": [
                    {
                        "day": "2026-03-15",
                        "name": "Run",
                        "distance_miles": 5.0,
                        "duration_minutes": 40,
                        "note": "I felt sick and dizzy after this run.",
                    },
                    {
                        "day": "2026-03-20",
                        "name": "Run",
                        "distance_miles": 4.0,
                        "duration_minutes": 31,
                        "note": "Legs were heavy but loosened up after warm-up.",
                    },
                ],
                "strength": [],
            },
            reference_day="2026-03-21",
        )

        self.assertIn("2026-03-20 Run", context)
        self.assertNotIn("2026-03-15", context)
        self.assertNotIn("felt sick", context.lower())

    @mock.patch.dict("os.environ", {}, clear=False)
    def test_llm_recommendation_reports_unavailable_without_key(self) -> None:
        recommendation, meta = llm_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 14),
        )
        self.assertEqual(meta["source"], "unavailable")
        self.assertNotEqual(recommendation.workout, "Recommendation unavailable")
        self.assertIn("OPENAI_API_KEY not set", recommendation.warnings)
        self.assertIn("overall", recommendation.explanation_sections)
        self.assertIn("built-in coaching rules", recommendation.explanation_sections["overall"])

    def test_projected_calendar_has_two_rest_days_and_three_lifts_per_week(self) -> None:
        recommendation = coach_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 14),
        )

        projections = projected_calendar_entries(
            anchor=date(2026, 3, 15),
            recommendation=recommendation,
            end_day=date(2026, 3, 22),
            profile=SAMPLE_PROFILE,
        )

        week = [projections[date(2026, 3, day).isoformat()] for day in range(16, 23)]
        rest_days = sum(1 for activities in week if not activities)
        lift_days = sum(1 for activities in week if any(activity.get("name") == "Lift" for activity in activities))

        self.assertEqual(rest_days, 2)
        self.assertEqual(lift_days, 3)

    def test_projected_calendar_keeps_long_run_on_preferred_day(self) -> None:
        recommendation = coach_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 14),
        )

        projections = projected_calendar_entries(
            anchor=date(2026, 3, 15),
            recommendation=recommendation,
            end_day=date(2026, 3, 22),
            profile=SAMPLE_PROFILE,
        )

        sunday_plan = projections[date(2026, 3, 22).isoformat()]
        run = next(activity for activity in sunday_plan if activity.get("name") == "Run")

        self.assertEqual(run["intensity"], "moderate")
        self.assertGreater(run["distance_miles"], 6.0)

    def test_projected_calendar_builds_roughly_ten_percent_each_week(self) -> None:
        recommendation = Recommendation(
            date="2026-03-16",
            workout="Easy aerobic run",
            intensity="easy",
            duration_minutes=48,
            run_distance_miles=5.0,
            run_pace_guidance="9:15-9:45/mi",
            lift_focus="Single-Leg Strength + Glutes",
            lift_guidance="1) Bulgarian split squats - 3 x 8. 2) Glute bridges - 3 x 10.",
            recap=[],
            explanation=[],
            explanation_sections={},
            warnings=[],
            confidence="high",
        )

        projections = projected_calendar_entries(
            anchor=date(2026, 3, 16),
            recommendation=recommendation,
            end_day=date(2026, 3, 29),
            profile=SAMPLE_PROFILE,
        )

        current_week_future = sum(
            activity.get("distance_miles", 0)
            for day in range(17, 23)
            for activity in projections[date(2026, 3, day).isoformat()]
            if activity.get("name") == "Run"
        )
        next_week = sum(
            activity.get("distance_miles", 0)
            for day in range(23, 30)
            for activity in projections[date(2026, 3, day).isoformat()]
            if activity.get("name") == "Run"
        )

        self.assertAlmostEqual(recommendation.run_distance_miles + current_week_future, 30.0, delta=0.6)
        self.assertAlmostEqual(next_week, 33.0, delta=0.6)

    def test_rest_day_offers_aggressive_shakeout_option_when_readiness_is_not_supported_false(self) -> None:
        recommendation = coach_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 21),
            subjective_feedback={"physical_feeling": "heavy", "mental_feeling": "steady", "notes": "legs felt tired yesterday"},
        )

        self.assertEqual(recommendation.run_distance_miles, 0.0)
        options, default_key = build_recommendation_options(
            recommendation,
            SAMPLE_PROFILE,
            subjective_feedback={"physical_feeling": "heavy", "mental_feeling": "steady", "notes": "legs felt tired yesterday"},
        )

        aggressive = next(option for option in options if option["key"] == "aggressive")["recommendation"]
        self.assertEqual(default_key, "conservative")
        self.assertGreater(aggressive["run_distance_miles"], 0.0)
        self.assertEqual(aggressive["intensity"], "easy")
        self.assertIn("shakeout", aggressive["workout"].lower())

    def test_projected_calendar_uses_pace_text_for_all_run_days(self) -> None:
        recommendation = Recommendation(
            date="2026-03-16",
            workout="Easy aerobic run",
            intensity="easy",
            duration_minutes=48,
            run_distance_miles=5.0,
            run_pace_guidance="9:15-9:45/mi",
            lift_focus="Single-Leg Strength + Glutes",
            lift_guidance="1) Bulgarian split squats - 3 x 8. 2) Glute bridges - 3 x 10.",
            recap=[],
            explanation=[],
            explanation_sections={},
            warnings=[],
            confidence="high",
        )

        projections = projected_calendar_entries(
            anchor=date(2026, 3, 16),
            recommendation=recommendation,
            end_day=date(2026, 3, 22),
            profile=SAMPLE_PROFILE,
        )

        run_pace_texts = [
            activity.get("pace_text", "")
            for day_activities in projections.values()
            for activity in day_activities
            if activity.get("name") == "Run"
        ]

        self.assertTrue(run_pace_texts)
        self.assertTrue(all("/mi" in text for text in run_pace_texts))

    def test_weekly_plan_structure_survives_rest_day_recommendation(self) -> None:
        low_readiness_metrics = SAMPLE_METRICS[:-1] + [
            type(SAMPLE_METRICS[-1])(
                day="2026-03-14",
                recovery_score=22,
                sleep_hours=4.8,
                resting_hr=58,
                hrv_ms=52,
                strain=14.0,
            )
        ]

        plan = _generate_weekly_plan(
            anchor=date(2026, 3, 14),
            profile=SAMPLE_PROFILE,
            runs=SAMPLE_RUNS,
            metrics=low_readiness_metrics,
        )

        future_runs = [
            activity
            for iso_day, activities in plan["activities"].items()
            if iso_day > "2026-03-14"
            for activity in activities
            if activity.get("name") == "Run"
        ]

        self.assertTrue(future_runs)

    def test_weekly_plan_is_established_from_prior_week_data(self) -> None:
        midweek_runs = SAMPLE_RUNS + [
            Run(
                day="2026-03-18",
                distance_miles=9.0,
                duration_minutes=67,
                effort="moderate",
                workout_type="steady",
                average_pace_min_per_mile=7.45,
            )
        ]

        monday_plan = _generate_weekly_plan(
            anchor=date(2026, 3, 16),
            profile=SAMPLE_PROFILE,
            runs=SAMPLE_RUNS,
            metrics=SAMPLE_METRICS,
        )
        wednesday_plan = _generate_weekly_plan(
            anchor=date(2026, 3, 18),
            profile=SAMPLE_PROFILE,
            runs=midweek_runs,
            metrics=SAMPLE_METRICS,
        )

        self.assertEqual(monday_plan["planned_from_day"], "2026-03-15")
        self.assertEqual(wednesday_plan["planned_from_day"], "2026-03-15")
        self.assertEqual(monday_plan["weekly_intent"], wednesday_plan["weekly_intent"])
        self.assertEqual(monday_plan["activities"], wednesday_plan["activities"])

    def test_calendar_days_only_returns_current_week(self) -> None:
        cards = calendar_days(
            activity_feed=[],
            metrics=SAMPLE_METRICS,
            recommendation=None,
            today="2026-03-14",
            profile=SAMPLE_PROFILE,
            weekly_plan={},
        )

        self.assertEqual(len(cards), 7)
        self.assertEqual(cards[0]["day"], "2026-03-09")
        self.assertEqual(cards[-1]["day"], "2026-03-15")

    def test_training_roadmap_returns_future_week_summaries(self) -> None:
        roadmap = build_training_roadmap(
            anchor=date(2026, 3, 14),
            profile=SAMPLE_PROFILE,
            runs=SAMPLE_RUNS,
            metrics=SAMPLE_METRICS,
        )

        self.assertEqual(len(roadmap), 4)
        self.assertEqual(roadmap[0]["week_start"], "2026-03-16")
        self.assertTrue(all(item["mileage_range"] for item in roadmap))
        self.assertTrue(all(item["confidence_note"] for item in roadmap))
        self.assertGreaterEqual(roadmap[1]["estimated_total_miles"], roadmap[0]["estimated_total_miles"])

    def test_uncertainty_assessment_returns_follow_up_questions(self) -> None:
        recommendation = coach_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 14),
            subjective_feedback={"physical_feeling": "normal", "mental_feeling": "steady", "notes": ""},
        )

        questions = assess_recommendation_uncertainty(
            SAMPLE_PROFILE,
            recommendation,
            subjective_feedback={"physical_feeling": "normal", "mental_feeling": "steady", "notes": ""},
        )

        self.assertTrue(questions)
        self.assertIn("prompt", questions[0])

    def test_recommendation_options_return_conservative_and_aggressive_paths(self) -> None:
        recommendation = coach_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 14),
            subjective_feedback={"physical_feeling": "normal", "mental_feeling": "steady"},
        )

        options, default_key = build_recommendation_options(
            recommendation,
            SAMPLE_PROFILE,
            subjective_feedback={"physical_feeling": "normal", "mental_feeling": "steady"},
        )

        self.assertEqual(len(options), 2)
        self.assertEqual({option["key"] for option in options}, {"conservative", "aggressive"})
        self.assertIn(default_key, {"conservative", "aggressive"})
        option_map = {option["key"]: option["recommendation"] for option in options}
        self.assertLessEqual(
            abs(option_map["aggressive"]["run_distance_miles"] - recommendation.run_distance_miles),
            0.8,
        )
        self.assertLessEqual(
            abs(option_map["conservative"]["run_distance_miles"] - recommendation.run_distance_miles),
            0.8,
        )
        self.assertEqual(
            option_map["conservative"]["daily_adaptation"]["weekly_goal_remains"],
            option_map["aggressive"]["daily_adaptation"]["weekly_goal_remains"],
        )

    def test_clarification_answers_persist_into_structured_settings(self) -> None:
        settings = {
            "athlete_name": "Jordan",
            "goal_half_marathon_time": "",
            "recent_race_result": "",
            "max_comfortable_long_run_miles": "",
        }

        updated = _apply_clarification_answers_to_settings(
            settings,
            {
                "clarification_answers": {
                    "goal_time": "1:45:00",
                    "benchmark": "Recent 10K",
                    "long_run_cap": "10",
                }
            },
        )

        self.assertEqual(updated["goal_half_marathon_time"], "1:45:00")
        self.assertEqual(updated["recent_race_result"], "Recent 10K")
        self.assertEqual(updated["max_comfortable_long_run_miles"], "10")

    def test_profile_settings_payload_exposes_top_level_integration_fields(self) -> None:
        settings = {
            "athlete_name": "Jordan",
            "goal_race_date": "2026-05-10",
            "weekly_mileage_target": "28",
            "preferred_long_run_day": "Sunday",
            "public_base_url": "https://coach.example.com",
            "strava": {"client_id": "abc", "client_secret": "secret"},
            "whoop": {"client_id": "whoop123", "client_secret": "secret2"},
        }

        payload = _profile_settings_payload(settings, load_tokens())

        self.assertEqual(payload["strava_client_id"], "abc")
        self.assertEqual(payload["whoop_client_id"], "whoop123")
        self.assertIn("connect_url", payload["strava"])

    def test_weekly_intent_exposes_phase_and_constraints(self) -> None:
        weekly_intent = build_weekly_intent(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 14),
        )

        self.assertTrue(weekly_intent.phase)
        self.assertTrue(weekly_intent.primary_adaptation)
        self.assertTrue(weekly_intent.strain_constraints)
        self.assertTrue(weekly_intent.non_negotiables)
        self.assertIn("easy", weekly_intent.pace_model)

    def test_recent_benchmark_influences_race_pace_anchor(self) -> None:
        benchmark_profile = AthleteProfile(
            name="Jordan",
            goal_race_date="2026-05-10",
            weekly_mileage_target=28,
            preferred_long_run_day="Sunday",
            recent_race_result="Recent 10K in 48:00",
        )

        pace_model = build_pace_model(benchmark_profile, SAMPLE_RUNS)

        self.assertIn("benchmark", pace_model.race_pace.basis.lower())
        self.assertIn(pace_model.race_pace.confidence, {"medium", "high"})

    def test_long_run_cap_keeps_weekly_projection_sane(self) -> None:
        capped_profile = AthleteProfile(
            name="Jordan",
            goal_race_date="2026-05-10",
            weekly_mileage_target=42,
            preferred_long_run_day="Sunday",
            max_comfortable_long_run_miles=8,
        )

        weekly_intent = build_weekly_intent(
            capped_profile,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 14),
        )

        self.assertLessEqual(weekly_intent.mileage_target, 26.0)
        self.assertTrue(weekly_intent.long_run_target.startswith("8 miles"))

    def test_future_week_labels_follow_realistic_half_marathon_progression(self) -> None:
        threshold_week = build_weekly_intent(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 16),
        )
        race_specific_week = build_weekly_intent(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 4, 6),
        )

        self.assertEqual(threshold_week.phase, "Threshold build")
        self.assertIn(race_specific_week.phase, {"Race-specific stamina", "Recovery / absorb"})

    def test_daily_adaptation_stays_aligned_with_weekly_goal(self) -> None:
        recommendation = coach_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 11),
            subjective_feedback={"physical_feeling": "heavy", "mental_feeling": "steady"},
        )

        self.assertIn("threshold", recommendation.daily_adaptation["weekly_goal_remains"].lower())
        self.assertIn(
            recommendation.daily_adaptation["readiness_status"],
            {"supported", "partly supported", "not supported"},
        )

    def test_pace_model_includes_multi_anchor_ranges(self) -> None:
        pace_model = build_pace_model(SAMPLE_PROFILE, SAMPLE_RUNS)

        self.assertIn("/mi", pace_model.easy.pace_range)
        self.assertIn("/mi", pace_model.steady.pace_range)
        self.assertIn("/mi", pace_model.threshold.pace_range)
        self.assertIn("/mi", pace_model.long_run.pace_range)
        self.assertIn("/mi", pace_model.race_pace.pace_range)

    def test_guardrails_turn_sick_day_into_rest(self) -> None:
        recommendation = Recommendation(
            date="2026-03-16",
            workout="Tempo session",
            intensity="hard",
            duration_minutes=60,
            run_distance_miles=6.5,
            run_pace_guidance="8:05-8:25/mi",
            lift_focus="Posterior Chain",
            lift_guidance="Romanian deadlifts 3x8",
            recap=[],
            explanation=[],
            explanation_sections={
                "overall": "",
                "run": "",
                "pace": "",
                "lift": "",
                "recovery": "",
            },
            warnings=[],
            confidence="medium",
        )

        guarded = _apply_guardrails(
            recommendation,
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            subjective_feedback={"physical_feeling": "sick", "mental_feeling": "steady"},
        )

        self.assertEqual(guarded.workout, "Rest and recovery")
        self.assertEqual(guarded.run_distance_miles, 0.0)
        self.assertEqual(guarded.lift_focus, "No lifting")

    def test_guardrails_turn_illness_notes_into_rest(self) -> None:
        recommendation = Recommendation(
            date="2026-03-16",
            workout="Easy aerobic run",
            intensity="easy",
            duration_minutes=40,
            run_distance_miles=4.0,
            run_pace_guidance="9:15-9:45/mi",
            lift_focus="Single-Leg Strength",
            lift_guidance="Bulgarian split squats 3x8",
            recap=[],
            explanation=[],
            explanation_sections={
                "overall": "",
                "run": "",
                "pace": "",
                "lift": "",
                "recovery": "",
            },
            warnings=[],
            confidence="medium",
        )

        guarded = _apply_guardrails(
            recommendation,
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            subjective_feedback={
                "physical_feeling": "normal",
                "mental_feeling": "steady",
                "notes": "I have a headache and feel unwell today.",
            },
        )

        self.assertEqual(guarded.workout, "Rest and recovery")
        self.assertEqual(guarded.run_distance_miles, 0.0)

    def test_guardrails_cap_excessive_distance_progression(self) -> None:
        recommendation = Recommendation(
            date="2026-03-16",
            workout="Steady endurance run",
            intensity="moderate",
            duration_minutes=85,
            run_distance_miles=10.0,
            run_pace_guidance="8:55-9:20/mi",
            lift_focus="Posterior Chain",
            lift_guidance="Romanian deadlifts 3x8",
            recap=[],
            explanation=[],
            explanation_sections={
                "overall": "",
                "run": "",
                "pace": "",
                "lift": "",
                "recovery": "",
            },
            warnings=[],
            confidence="medium",
        )

        guarded = _apply_guardrails(
            recommendation,
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            subjective_feedback={"physical_feeling": "normal", "mental_feeling": "steady"},
        )

        self.assertLessEqual(guarded.run_distance_miles, 9.8)
        self.assertTrue(any("Progression guardrail" in item for item in guarded.warnings))

    def test_guardrails_allow_run_only_day_with_lifting_off_day_message(self) -> None:
        recommendation = Recommendation(
            date="2026-03-16",
            workout="Steady endurance run",
            intensity="moderate",
            duration_minutes=55,
            run_distance_miles=6.0,
            run_pace_guidance="8:55-9:20/mi",
            lift_focus="Posterior Chain",
            lift_guidance="Romanian deadlifts 3x8",
            recap=[],
            explanation=[],
            explanation_sections={
                "overall": "",
                "run": "",
                "pace": "",
                "lift": "",
                "recovery": "",
            },
            warnings=[],
            confidence="medium",
        )

        guarded = _apply_guardrails(
            recommendation,
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            subjective_feedback={"physical_feeling": "normal", "mental_feeling": "steady"},
        )

        self.assertEqual(guarded.lift_focus, "Today is a lifting off-day")
        self.assertEqual(guarded.lift_guidance, "Today is a lifting off-day.")

    def test_guardrails_reintroduce_lift_when_strength_is_behind_and_day_is_easy(self) -> None:
        recommendation = Recommendation(
            date="2026-03-16",
            workout="Easy aerobic run",
            intensity="easy",
            duration_minutes=38,
            run_distance_miles=3.4,
            run_pace_guidance="9:15-9:45/mi",
            lift_focus="No lifting",
            lift_guidance="No lifting today.",
            recap=[],
            explanation=[],
            explanation_sections={
                "overall": "",
                "run": "",
                "pace": "",
                "lift": "",
                "recovery": "",
            },
            warnings=[],
            confidence="medium",
        )

        guarded = _apply_guardrails(
            recommendation,
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            subjective_feedback={
                "physical_feeling": "normal",
                "mental_feeling": "steady",
                "weekly_strength_sessions_completed": 1,
                "strength_sessions_last_2_days": 0,
                "has_strength_activity_today": False,
            },
        )

        self.assertEqual(guarded.lift_focus, "Light durability work only")
        self.assertIn("short lift", guarded.lift_guidance.lower())

    def test_llm_guardrails_do_not_force_rest_for_heavy_legs_when_recovery_is_good(self) -> None:
        metrics = list(SAMPLE_METRICS)
        metrics[-1] = RecoveryMetrics(
            day=metrics[-1].day,
            recovery_score=78,
            sleep_hours=6.5,
            resting_hr=53,
            hrv_ms=metrics[-1].hrv_ms,
            strain=metrics[-1].strain,
        )
        recommendation = Recommendation(
            date=metrics[-1].day,
            workout="Tempo session",
            intensity="hard",
            duration_minutes=55,
            run_distance_miles=5.5,
            run_pace_guidance="8:05-8:25/mi",
            lift_focus="Posterior Chain",
            lift_guidance="Romanian deadlifts 3x8",
            recap=[],
            explanation=[],
            explanation_sections={
                "overall": "",
                "run": "",
                "pace": "",
                "lift": "",
                "recovery": "",
            },
            warnings=[],
            confidence="medium",
        )

        guarded = _apply_guardrails(
            recommendation,
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            metrics,
            subjective_feedback={"physical_feeling": "heavy", "mental_feeling": "steady"},
        )

        self.assertNotEqual(guarded.workout, "Rest and recovery")
        self.assertGreater(guarded.run_distance_miles, 0.0)
        self.assertEqual(guarded.intensity, "easy")

    def test_planned_rest_day_is_not_mislabeled_as_readiness_failure(self) -> None:
        weekly_intent = build_weekly_intent(SAMPLE_PROFILE, SAMPLE_RUNS, SAMPLE_METRICS, today=date(2026, 3, 21))
        recommendation = Recommendation(
            date="2026-03-21",
            workout="Rest and recovery",
            intensity="rest",
            duration_minutes=0,
            run_distance_miles=0.0,
            run_pace_guidance="Rest day",
            lift_focus="No lifting",
            lift_guidance="Rest today.",
            recap=[],
            explanation=["Guardrail: readiness is too low for productive training, so the plan was downshifted to recovery."],
            explanation_sections={
                "overall": "Today is better used as a recovery day because your readiness signals and/or subjective feedback do not support training stress.",
                "run": "",
                "pace": "",
                "lift": "",
                "recovery": "",
            },
            warnings=["Guardrail triggered: today should be a rest or recovery-focused day, not a training day."],
            confidence="high",
            planned_workout="Rest or optional mobility",
            planned_run_distance_miles=0.0,
            planned_pace_guidance="Rest day",
            pace_model=build_pace_model(SAMPLE_PROFILE, SAMPLE_RUNS).to_dict(),
            weekly_intent=weekly_intent.to_dict(),
        )

        finalized = _finalize_daily_adaptation(
            recommendation,
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            {"workout": "Rest or optional mobility", "distance_miles": 0.0, "pace_guidance": "Rest day"},
            weekly_intent,
            subjective_feedback={"physical_feeling": "heavy", "mental_feeling": "steady", "notes": "legs felt tired yesterday"},
        )

        self.assertEqual(finalized.workout, "Rest or optional mobility")
        self.assertEqual(finalized.daily_adaptation["readiness_status"], "supported")
        self.assertNotIn("Guardrail:", " ".join(finalized.explanation))
        self.assertFalse(any("Guardrail triggered" in item for item in finalized.warnings))
        self.assertIn("week", finalized.daily_adaptation["adjustment_reason"].lower())

    def test_recommendation_options_keep_aggressive_variant_more_demanding(self) -> None:
        recommendation = Recommendation(
            date="2026-03-16",
            workout="Easy aerobic run",
            intensity="easy",
            duration_minutes=36,
            run_distance_miles=3.5,
            run_pace_guidance="8:49-9:10/mi",
            lift_focus="Light durability work only",
            lift_guidance="Short post-run lift.",
            recap=[],
            explanation=["Recovery is strong, so a short easy run fits today."],
            explanation_sections={},
            warnings=[],
            confidence="high",
            planned_workout="Rest or optional mobility",
            planned_run_distance_miles=4.0,
            planned_pace_guidance="Rest day",
            pace_model=build_pace_model(SAMPLE_PROFILE, SAMPLE_RUNS).to_dict(),
            weekly_intent=build_weekly_intent(SAMPLE_PROFILE, SAMPLE_RUNS, SAMPLE_METRICS, today=date(2026, 3, 16)).to_dict(),
            daily_adaptation={"readiness_status": "supported"},
        )

        options, _ = build_recommendation_options(
            recommendation,
            SAMPLE_PROFILE,
            subjective_feedback={
                "weekly_strength_sessions_completed": 1,
                "strength_sessions_last_2_days": 0,
                "has_strength_activity_today": False,
            },
        )

        conservative = next(option["recommendation"] for option in options if option["key"] == "conservative")
        aggressive = next(option["recommendation"] for option in options if option["key"] == "aggressive")

        self.assertEqual(conservative["workout"], "Easy aerobic run")
        self.assertNotIn("rest", aggressive["workout"].lower())
        self.assertGreaterEqual(aggressive["run_distance_miles"], conservative["run_distance_miles"])
        self.assertGreaterEqual(
            {"rest": 0, "very easy": 1, "easy": 2, "moderate": 3, "hard": 4}.get(aggressive["intensity"], 2),
            {"rest": 0, "very easy": 1, "easy": 2, "moderate": 3, "hard": 4}.get(conservative["intensity"], 2),
        )

    def test_recommendation_training_context_counts_weekly_strength_days(self) -> None:
        activity_feed = [
            {"day": "2026-03-16", "name": "Strength Training", "duration_minutes": 35, "strain": 8.2},
            {"day": "2026-03-17", "name": "Run", "distance_miles": 4.0, "duration_minutes": 32},
            {"day": "2026-03-18", "name": "Weight Lifting", "duration_minutes": 42, "strain": 9.1},
            {"day": "2026-03-19", "name": "Yoga", "duration_minutes": 20, "strain": 4.0},
        ]

        context = _recommendation_training_context(activity_feed, "2026-03-19")

        self.assertEqual(context["weekly_strength_sessions_completed"], 3)
        self.assertEqual(context["strength_sessions_last_2_days"], 1)
        self.assertTrue(context["has_strength_activity_today"])
        self.assertEqual(context["today_completed_strain"], 4.0)

    def test_current_day_status_marks_logged_run_as_on_track(self) -> None:
        recommendation = Recommendation(
            date="2026-03-18",
            workout="Easy aerobic run",
            intensity="easy",
            duration_minutes=40,
            run_distance_miles=3.2,
            run_pace_guidance="9:15-9:45/mi",
            lift_focus="No lifting",
            lift_guidance="No lifting today.",
            recap=[],
            explanation=[],
            explanation_sections={},
            warnings=[],
            confidence="high",
        )
        activity_feed = [
            {
                "name": "Run",
                "sport": "Run",
                "day": "2026-03-18",
                "distance_miles": 3.3,
                "duration_minutes": 24,
                "average_pace_min_per_mile": 7.3,
            }
        ]

        status = _current_day_status("2026-03-18", activity_feed, recommendation)

        self.assertEqual(status["status"], "on_track")
        self.assertIn("3.3", status["detail"])

    def test_projected_paces_separate_easy_and_quality_days(self) -> None:
        weekly_intent = build_weekly_intent(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 18),
        )
        recommendation = coach_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 18),
            weekly_intent=weekly_intent,
        )

        easy_pace = _pace_text_for_type("easy", recommendation, weekly_intent=weekly_intent.to_dict())
        quality_pace = _pace_text_for_type("quality", recommendation, weekly_intent=weekly_intent.to_dict())

        self.assertNotEqual(easy_pace, quality_pace)


if __name__ == "__main__":
    unittest.main()
