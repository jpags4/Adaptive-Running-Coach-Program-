import unittest
from datetime import date
from unittest import mock

from app import (
    _activity_key,
    _activity_notes_context,
    _apply_prior_week_completion_cap,
    _apply_clarification_answers_to_settings,
    _attach_activity_notes,
    _generate_weekly_plan,
    _planned_skip_today,
    _recent_checkin_context,
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
    _build_planned_workout_payload,
    AthleteProfile,
    Recommendation,
    RecoveryMetrics,
    Run,
    assess_recommendation_uncertainty,
    build_pace_model,
    build_recommendation_options,
    build_weekly_intent,
    calculate_readiness_result,
    coach_recommendation,
    deterministic_recommendation,
    planned_session_for_day,
)
from integrations import (
    build_strava_authorize_url,
    build_whoop_authorize_url,
    strava_activity_preview,
    strava_runs_to_model,
    whoop_workout_preview,
)
from llm_coach import _apply_guardrails, _finalize_daily_adaptation, _safety_and_progression_context, llm_recommendation
from llm_coach import (
    build_explanation_prompt,
    build_template_fallback_explanation,
    generate_recommendation_explanation,
)
from sample_data import SAMPLE_METRICS, SAMPLE_PROFILE, SAMPLE_RUNS


class CoachRecommendationTests(unittest.TestCase):
    def _make_explanation_inputs(
        self,
        *,
        plan_status: str,
        planned_type: str = "tempo",
        planned_label: str = "Threshold Intervals",
        planned_miles: float | None = 5.0,
        should_run: bool = True,
        run_label: str = "Threshold Intervals",
        run_intensity: str = "hard",
        run_miles: float | None = 5.0,
        run_pace: str = "7:20-7:35/mi",
        should_lift: bool = False,
        lift_label: str = "No lift today",
        flags: dict | None = None,
    ) -> dict:
        default_flags = {
            "reduceIntensity": False,
            "reduceVolume": False,
            "avoidSpeedWork": False,
            "avoidHeavyLifting": False,
            "forceRestOrCrossTrain": False,
            "injuryOverride": False,
            "mentalDownshift": False,
            "highStrainCaution": False,
            "elevatedHrCaution": False,
        }
        if flags:
            default_flags.update(flags)

        recommendation = Recommendation(
            date="2026-03-25",
            workout=run_label if should_run else "Rest and recovery",
            intensity=run_intensity,
            duration_minutes=48 if run_miles else 0,
            run_distance_miles=float(run_miles or 0.0),
            run_pace_guidance=run_pace if run_miles else "Rest day",
            lift_focus=lift_label,
            lift_guidance="Keep lifting light." if should_lift else "No lift today.",
            recap=[],
            explanation=[],
            explanation_sections={
                "overall": "",
                "run": "Preserved movement but removed workout intensity." if plan_status != "preserved" else "Kept the planned movement in place.",
                "pace": "Used easier pace guidance instead of workout pace." if plan_status != "preserved" else "The planned pace still fits today.",
                "lift": "No lift today because recovery is more important than adding extra training load.",
                "recovery": "Recovery signals shaped the recommendation.",
            },
            warnings=["Elevated resting HR added caution."] if default_flags["elevatedHrCaution"] else [],
            confidence="high",
            planned_workout=planned_label,
            planned_run_distance_miles=float(planned_miles or 0.0),
            planned_pace_guidance=run_pace if planned_miles else "Rest day",
            daily_adaptation={
                "planned_session": planned_label,
                "readiness_status": "supported" if plan_status == "preserved" else "partly supported" if plan_status == "modified" else "not supported",
                "readiness_score": 86 if plan_status == "preserved" else 58 if plan_status == "modified" else 24,
                "readiness_tier": "high" if plan_status == "preserved" else "moderate" if plan_status == "modified" else "low",
                "decision": "push" if plan_status == "preserved" else "maintain" if plan_status == "modified" else "pull_back",
                "flags": default_flags,
                "adjustment_reason": "",
                "adjusted_session": run_label if should_run else "Rest and recovery",
                "weekly_goal_remains": "Keep the week moving.",
                "reschedule_suggestion": "Reassess tomorrow.",
                "plan_status": plan_status,
                "plan_status_label": "As Planned" if plan_status == "preserved" else "Adjusted" if plan_status == "modified" else "Changed",
                "summary_label": run_label if should_run else "Recovery Day",
                "run": {
                    "shouldRun": should_run,
                    "label": run_label if should_run else "Recovery / Cross-Train",
                    "miles": run_miles,
                    "durationMin": 48 if run_miles else 20,
                    "paceRange": {"min": "7:20", "max": "7:35"} if should_run and run_intensity == "hard" else {"min": "9:08", "max": "9:29"} if should_run else None,
                    "intensity": run_intensity if should_run else "rest",
                },
                "lift": {
                    "shouldLift": should_lift,
                    "label": lift_label,
                    "guidance": ["Keep total lift under 20 minutes."] if should_lift else ["Prioritize recovery and reassess tomorrow."],
                },
                "rationale_tags": ["preserve_structure"] if plan_status == "preserved" else ["reduce_volume"] if plan_status == "modified" else ["injury_override"],
            },
        )
        planned_workout = {
            "label": planned_label,
            "type": planned_type,
            "plannedMiles": planned_miles,
            "paceRange": {"min": "7:20", "max": "7:35"} if planned_miles else None,
        }
        return {
            "recommendation": recommendation,
            "plannedWorkout": planned_workout,
            "athleteName": "Taylor",
        }

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

    def test_activity_notes_context_drops_old_health_note_when_today_checkin_is_positive(self) -> None:
        context = _activity_notes_context(
            {
                "runs": [
                    {
                        "day": "2026-03-18",
                        "name": "Run",
                        "distance_miles": 3.3,
                        "duration_minutes": 24,
                        "note": "I felt sick and dizzy after this run.",
                    },
                    {
                        "day": "2026-03-20",
                        "name": "Run",
                        "distance_miles": 4.0,
                        "duration_minutes": 31,
                        "note": "Felt smooth and controlled.",
                    },
                ],
                "strength": [],
            },
            reference_day="2026-03-21",
            current_feedback={"physical_feeling": "fresh", "mental_feeling": "sharp", "notes": ""},
        )

        self.assertNotIn("felt sick", context.lower())
        self.assertIn("felt smooth", context.lower())

    def test_recent_checkin_context_keeps_recent_skip_signal(self) -> None:
        context = _recent_checkin_context(
            {
                "2026-03-20": {
                    "physical_feeling": "normal",
                    "mental_feeling": "steady",
                    "notes": "I am not running today.",
                    "planned_skip_today": True,
                }
            },
            "2026-03-21",
        )

        self.assertIn("planned to skip", context.lower())
        self.assertIn("2026-03-20", context)

    def test_planned_skip_today_detects_skip_phrases(self) -> None:
        self.assertTrue(_planned_skip_today({"notes": "I am not going to run today."}))
        self.assertFalse(_planned_skip_today({"notes": "Ready to run tomorrow."}))

    def test_old_workout_notes_do_not_become_todays_illness_checkin(self) -> None:
        context = _safety_and_progression_context(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            "2026-03-21",
            {
                "physical_feeling": "fresh",
                "mental_feeling": "sharp",
                "notes": "",
                "recent_workout_notes": "2026-03-18 Run (3.3 mi, 24 min): I felt sick and dizzy after this run.",
            },
        )

        self.assertFalse(context["illness_noted_in_checkin"])
        self.assertEqual(context["subjective_physical"], "fresh")
        self.assertEqual(context["subjective_mental"], "sharp")
        self.assertIn("felt sick", context["recent_workout_notes"].lower())

    @mock.patch.dict("os.environ", {}, clear=False)
    def test_llm_recommendation_uses_deterministic_backend_engine(self) -> None:
        recommendation, meta = llm_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 14),
        )
        self.assertEqual(meta["source"], "deterministic")
        self.assertIn("overall", recommendation.explanation_sections)
        self.assertNotIn("OPENAI_API_KEY not set", recommendation.warnings)
        self.assertTrue(recommendation.explanation_sections["overall"].startswith("Plan status:"))
        self.assertTrue(recommendation.explanation)
        self.assertIn("recommendation_explanation", meta)
        self.assertIn(meta["recommendation_explanation"]["source"], {"llm", "template_fallback"})

    def test_preserved_explanation_says_workout_is_supported(self) -> None:
        explanation = build_template_fallback_explanation(self._make_explanation_inputs(plan_status="preserved"))
        self.assertTrue(any(token in explanation["summary"].lower() for token in ["good day", "original session", "readiness looks solid"]))
        self.assertTrue(str(explanation["decisionDrivers"]).startswith("Decision drivers:"))
        self.assertEqual(explanation["source"], "template_fallback")

    def test_modified_explanation_says_session_is_adjusted(self) -> None:
        explanation = build_template_fallback_explanation(
            self._make_explanation_inputs(
                plan_status="modified",
                run_label="Easy Run",
                run_intensity="easy",
                run_pace="9:08-9:29/mi",
            )
        )
        self.assertTrue(any(token in explanation["summary"].lower() for token in ["less stress", "fits today better", "keeping the day on track"]))
        self.assertIn("Decision drivers:", explanation["decisionDrivers"])

    def test_replaced_explanation_says_recovery_takes_priority(self) -> None:
        explanation = build_template_fallback_explanation(
            self._make_explanation_inputs(
                plan_status="replaced",
                should_run=False,
                run_label="Recovery Day",
                run_intensity="rest",
                run_miles=None,
                planned_type="easy_run",
            )
        )
        self.assertTrue(any(token in explanation["summary"].lower() for token in ["replaced", "recovery", "priority"]))
        self.assertIn("Decision drivers:", explanation["decisionDrivers"])

    def test_injury_override_adds_caution_note(self) -> None:
        explanation = build_template_fallback_explanation(
            self._make_explanation_inputs(
                plan_status="replaced",
                should_run=False,
                run_label="Recovery Day",
                run_intensity="rest",
                run_miles=None,
                flags={"injuryOverride": True, "forceRestOrCrossTrain": True},
            )
        )
        self.assertTrue(explanation["cautionNote"])
        self.assertIn("reassess", explanation["cautionNote"].lower())

    @mock.patch("llm_coach.openai_enabled", return_value=True)
    @mock.patch("llm_coach._request_explanation_json", side_effect=ValueError("bad json"))
    def test_malformed_llm_json_uses_fallback(self, _request, _enabled) -> None:
        explanation = generate_recommendation_explanation(self._make_explanation_inputs(plan_status="modified"))
        self.assertEqual(explanation["source"], "template_fallback")

    @mock.patch("llm_coach.openai_enabled", return_value=True)
    @mock.patch("llm_coach._request_explanation_json")
    def test_no_run_recommendation_cannot_return_run_language(self, request_mock, _enabled) -> None:
        request_mock.return_value = {
            "summary": "Go run today and keep it short.",
            "whyBullets": ["Easy day."],
            "decisionDrivers": "Decision drivers: Easy day.",
            "cautionNote": None,
            "encouragement": None,
        }
        explanation = generate_recommendation_explanation(
            self._make_explanation_inputs(
                plan_status="replaced",
                should_run=False,
                run_label="Recovery Day",
                run_intensity="rest",
                run_miles=None,
                flags={"injuryOverride": True, "forceRestOrCrossTrain": True},
            )
        )
        self.assertEqual(explanation["source"], "template_fallback")
        self.assertNotIn("go run", explanation["summary"].lower())

    def test_fallback_output_has_valid_structure(self) -> None:
        explanation = build_template_fallback_explanation(self._make_explanation_inputs(plan_status="modified"))
        self.assertTrue(explanation["summary"])
        self.assertIsInstance(explanation["whyBullets"], list)
        self.assertLessEqual(len(explanation["whyBullets"]), 3)
        self.assertIn("decisionDrivers", explanation)
        self.assertIn("source", explanation)

    def test_build_explanation_prompt_includes_final_plan_status(self) -> None:
        prompt = build_explanation_prompt(self._make_explanation_inputs(plan_status="preserved"))
        self.assertIn("plan status: preserved", prompt["user"])

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

    def test_rest_day_keeps_rest_when_readiness_is_low_in_deterministic_options(self) -> None:
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
        self.assertEqual(aggressive["run_distance_miles"], 0.0)
        self.assertIn(aggressive["intensity"], {"rest", "very easy"})

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

    def test_prior_week_completion_cap_lowers_unreachable_next_week_target(self) -> None:
        weekly_intent = build_weekly_intent(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS,
            today=date(2026, 3, 23),
        )
        original_target = weekly_intent.mileage_target
        capped = _apply_prior_week_completion_cap(weekly_intent, SAMPLE_RUNS, date(2026, 3, 22))

        self.assertLessEqual(capped.mileage_target, original_target)
        self.assertLessEqual(capped.mileage_target, 27.5)

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

    def test_deterministic_recommendation_removes_hard_work_when_high_strain_and_elevated_hr_stack(self) -> None:
        today = date(2026, 3, 24)
        metrics = [
            RecoveryMetrics(day="2026-03-18", recovery_score=74, sleep_hours=7.8, resting_hr=53, hrv_ms=66, strain=8.4),
            RecoveryMetrics(day="2026-03-19", recovery_score=71, sleep_hours=7.4, resting_hr=52, hrv_ms=64, strain=9.2),
            RecoveryMetrics(day="2026-03-20", recovery_score=69, sleep_hours=7.1, resting_hr=53, hrv_ms=63, strain=10.1),
            RecoveryMetrics(day="2026-03-21", recovery_score=68, sleep_hours=7.0, resting_hr=54, hrv_ms=62, strain=9.5),
            RecoveryMetrics(day="2026-03-22", recovery_score=72, sleep_hours=7.6, resting_hr=52, hrv_ms=65, strain=8.8),
            RecoveryMetrics(day="2026-03-23", recovery_score=70, sleep_hours=7.3, resting_hr=53, hrv_ms=64, strain=9.0),
            RecoveryMetrics(day="2026-03-24", recovery_score=57, sleep_hours=7.2, resting_hr=57, hrv_ms=61, strain=13.4),
        ]
        weekly_intent = _scenario_weekly_intent(today, primary_adaptation="threshold")

        recommendation = deterministic_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            metrics,
            today=today,
            subjective_feedback={"physical_feeling": "normal", "mental_feeling": "steady", "notes": ""},
            weekly_intent=weekly_intent,
            mode="conservative",
        )

        self.assertEqual(recommendation.intensity, "easy")
        self.assertNotIn("threshold", recommendation.workout.lower())
        self.assertEqual(recommendation.run_pace_guidance, "10:00-10:21/mi")
        self.assertEqual(recommendation.daily_adaptation.get("plan_status"), "modified")

    def test_plan_status_is_modified_when_long_run_is_trimmed(self) -> None:
        today = date(2026, 3, 29)
        metric = _harness_metric("2026-03-29", 54, 7.4, 54, 15.2)
        metrics = _harness_metrics_window(today, metric, baseline_rhr=53)
        weekly_intent = _scenario_weekly_intent(today)

        recommendation = deterministic_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            metrics,
            today=today,
            subjective_feedback={"physical_feeling": "normal", "mental_feeling": "steady", "notes": ""},
            weekly_intent=weekly_intent,
            mode="conservative",
        )

        self.assertEqual(recommendation.daily_adaptation.get("plan_status"), "modified")
        self.assertLess(recommendation.run_distance_miles, recommendation.planned_run_distance_miles)


def _harness_metric(day: str, recovery: int, sleep: float, resting_hr: int, strain: float) -> RecoveryMetrics:
    return RecoveryMetrics(
        day=day,
        recovery_score=recovery,
        sleep_hours=sleep,
        resting_hr=resting_hr,
        hrv_ms=65,
        strain=strain,
    )


def _harness_metrics_window(today: date, current_metric: RecoveryMetrics, baseline_rhr: int = 53) -> list[RecoveryMetrics]:
    metrics: list[RecoveryMetrics] = []
    for days_back, strain in zip(range(6, 0, -1), [8.4, 9.2, 10.1, 9.5, 8.8, 9.0]):
        day_value = today.fromordinal(today.toordinal() - days_back)
        resting_hr = baseline_rhr if days_back % 2 == 0 else baseline_rhr - 1
        metrics.append(
            RecoveryMetrics(
                day=day_value.isoformat(),
                recovery_score=72,
                sleep_hours=7.4,
                resting_hr=resting_hr,
                hrv_ms=64,
                strain=strain,
            )
        )
    metrics.append(current_metric)
    return metrics


def _scenario_weekly_intent(today: date, primary_adaptation: str | None = None, week_type: str | None = None):
    weekly_intent = build_weekly_intent(SAMPLE_PROFILE, SAMPLE_RUNS, SAMPLE_METRICS, today=today)
    if primary_adaptation:
        weekly_intent.primary_adaptation = primary_adaptation
    if week_type:
        weekly_intent.week_type = week_type
    return weekly_intent


def _format_flag_summary(flags: dict) -> str:
    active = [key for key, value in flags.items() if value]
    return ", ".join(active) if active else "none"


def print_deterministic_recommendation_harness() -> None:
    baseline_rhr = 53.0
    scenarios = [
        {
            "name": "1. Green Easy Monday",
            "today": date(2026, 3, 23),
            "metric": _harness_metric("2026-03-23", 84, 8.1, 52, 7.0),
            "feedback": {"physical_feeling": "fresh", "mental_feeling": "sharp", "notes": "felt good yesterday"},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 23)),
        },
        {
            "name": "2. Tempo Day Downgraded",
            "today": date(2026, 3, 24),
            "metric": _harness_metric("2026-03-24", 57, 7.2, 57, 13.4),
            "feedback": {"physical_feeling": "normal", "mental_feeling": "steady", "notes": ""},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 24), primary_adaptation="threshold"),
            "metrics": _harness_metrics_window(date(2026, 3, 24), _harness_metric("2026-03-24", 57, 7.2, 57, 13.4), baseline_rhr=53),
        },
        {
            "name": "3. Low-Readiness Easy Monday",
            "today": date(2026, 3, 30),
            "metric": _harness_metric("2026-03-30", 38, 5.4, 58, 14.8),
            "feedback": {"physical_feeling": "heavy", "mental_feeling": "drained", "notes": "fatigue and heavy legs"},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 30)),
        },
        {
            "name": "4. Long Run Trimmed",
            "today": date(2026, 3, 29),
            "metric": _harness_metric("2026-03-29", 54, 7.4, 54, 15.2),
            "feedback": {"physical_feeling": "normal", "mental_feeling": "steady", "notes": ""},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 29)),
        },
        {
            "name": "5. Injury Override",
            "today": date(2026, 3, 24),
            "metric": _harness_metric("2026-03-24", 82, 8.0, 52, 8.3),
            "feedback": {"physical_feeling": "injured", "mental_feeling": "steady", "notes": "calf tightness and tingling"},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 24), primary_adaptation="threshold"),
        },
        {
            "name": "6. Rest Day Stays Rest",
            "today": date(2026, 3, 25),
            "metric": _harness_metric("2026-03-25", 79, 7.9, 53, 7.5),
            "feedback": {"physical_feeling": "fresh", "mental_feeling": "sharp", "notes": ""},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 25)),
        },
        {
            "name": "7. Race-Specific Day Supported",
            "today": date(2026, 3, 24),
            "metric": _harness_metric("2026-03-24", 81, 7.8, 53, 9.0),
            "feedback": {"physical_feeling": "normal", "mental_feeling": "sharp", "notes": "good energy"},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 24), primary_adaptation="race-specific stamina"),
        },
        {
            "name": "8. Subjective Fatigue Overrides Okay Biometrics",
            "today": date(2026, 3, 27),
            "metric": _harness_metric("2026-03-27", 72, 7.6, 54, 9.8),
            "feedback": {"physical_feeling": "sore", "mental_feeling": "drained", "notes": "aching and tired"},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 27)),
        },
        {
            "name": "9. Moderate Easy Day With Elevated HR",
            "today": date(2026, 3, 27),
            "metric": _harness_metric("2026-03-27", 63, 6.8, 59, 10.5),
            "feedback": {"physical_feeling": "normal", "mental_feeling": "steady", "notes": ""},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 27)),
        },
        {
            "name": "10. Very Low Sleep Preserves Recovery",
            "today": date(2026, 3, 28),
            "metric": _harness_metric("2026-03-28", 44, 4.8, 56, 11.2),
            "feedback": {"physical_feeling": "normal", "mental_feeling": "stressed", "notes": "tired but no pain"},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 28)),
        },
    ]

    for scenario in scenarios:
        today = scenario["today"]
        metric = scenario["metric"]
        feedback = scenario["feedback"]
        weekly_intent = scenario["weekly_intent"]
        metrics = scenario.get("metrics") or [metric]
        planned = planned_session_for_day(weekly_intent, SAMPLE_PROFILE, today)
        readiness = calculate_readiness_result(metric, baseline_rhr, feedback)
        recommendation = deterministic_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            metrics,
            today=today,
            subjective_feedback=feedback,
            weekly_intent=weekly_intent,
            mode="conservative",
        )

        print(f"\n=== {scenario['name']} ===")
        print(
            f"planned: {planned['workout']} | biometrics: recovery {metric.recovery_score}, "
            f"sleep {metric.sleep_hours:.1f}h, rhr {metric.resting_hr} vs baseline {baseline_rhr:.0f}, strain {metric.strain:.1f}"
        )
        print(
            f"check-in: legs={feedback['physical_feeling']}, mental={feedback['mental_feeling']}, notes={repr(feedback['notes'])}"
        )
        print(
            f"readiness: {readiness['score']} ({readiness['tier']}) | decision: {readiness['decision']} | "
            f"flags: {_format_flag_summary(readiness['flags'])}"
        )
        print(
            f"run: {recommendation.workout} | {recommendation.run_distance_miles:.1f} mi | "
            f"{recommendation.run_pace_guidance} | intensity={recommendation.intensity}"
        )
        print(f"lift: {recommendation.lift_focus} | guidance={recommendation.lift_guidance or '-'}")


def print_plan_preserved_scenarios() -> None:
    print("\nPlan Preserved Scenarios")
    baseline_rhr = 53.0
    scenarios = [
        {
            "name": "A. Tempo Supported",
            "today": date(2026, 3, 24),
            "metric": _harness_metric("2026-03-24", 86, 8.2, 52, 7.4),
            "feedback": {"physical_feeling": "fresh", "mental_feeling": "sharp", "notes": "felt good yesterday"},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 24), primary_adaptation="threshold"),
        },
        {
            "name": "B. Intervals Supported",
            "today": date(2026, 3, 24),
            "metric": _harness_metric("2026-03-24", 88, 8.0, 53, 7.1),
            "feedback": {"physical_feeling": "normal", "mental_feeling": "sharp", "notes": "good energy"},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 24), primary_adaptation="threshold"),
            "force_label": "Intervals",
            "force_type": "intervals",
        },
        {
            "name": "C. Long Run Supported",
            "today": date(2026, 3, 29),
            "metric": _harness_metric("2026-03-29", 83, 8.1, 53, 7.8),
            "feedback": {"physical_feeling": "fresh", "mental_feeling": "steady", "notes": ""},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 29)),
        },
    ]

    for scenario in scenarios:
        today = scenario["today"]
        metric = scenario["metric"]
        feedback = scenario["feedback"]
        weekly_intent = scenario["weekly_intent"]
        planned = planned_session_for_day(weekly_intent, SAMPLE_PROFILE, today)
        if scenario.get("force_label"):
            planned["workout"] = scenario["force_label"]
        if scenario.get("force_type") == "intervals":
            weekly_intent.primary_adaptation = "threshold"
        readiness = calculate_readiness_result(metric, baseline_rhr, feedback)
        recommendation = deterministic_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            SAMPLE_METRICS[:-1] + [metric],
            today=today,
            subjective_feedback=feedback,
            weekly_intent=weekly_intent,
            mode="conservative",
        )

        print(f"\n=== {scenario['name']} ===")
        print(
            f"planned: {planned['workout']} | biometrics: recovery {metric.recovery_score}, "
            f"sleep {metric.sleep_hours:.1f}h, rhr {metric.resting_hr} vs baseline {baseline_rhr:.0f}, strain {metric.strain:.1f}"
        )
        print(
            f"check-in: legs={feedback['physical_feeling']}, mental={feedback['mental_feeling']}, notes={repr(feedback['notes'])}"
        )
        print(
            f"readiness: {readiness['score']} ({readiness['tier']}) | decision: {readiness['decision']} | "
            f"flags: {_format_flag_summary(readiness['flags'])}"
        )
        print(
            f"run: {recommendation.workout} | {recommendation.run_distance_miles:.1f} mi | "
            f"{recommendation.run_pace_guidance} | intensity={recommendation.intensity}"
        )
        print(f"lift: {recommendation.lift_focus} | guidance={recommendation.lift_guidance or '-'}")
        print(f"overall: {recommendation.explanation_sections.get('overall', '')}")


def print_recommendation_explanation_harness() -> None:
    scenarios = [
        {
            "name": "High-Readiness Preserved",
            "today": date(2026, 3, 24),
            "metric": _harness_metric("2026-03-24", 86, 8.2, 52, 7.4),
            "feedback": {"physical_feeling": "fresh", "mental_feeling": "sharp", "notes": "felt good yesterday"},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 24), primary_adaptation="threshold"),
        },
        {
            "name": "Preserved Low-Recovery Easy Day",
            "today": date(2026, 3, 23),
            "metric": _harness_metric("2026-03-23", 48, 7.3, 54, 9.0),
            "feedback": {"physical_feeling": "normal", "mental_feeling": "steady", "notes": ""},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 23)),
            "metrics": _harness_metrics_window(date(2026, 3, 23), _harness_metric("2026-03-23", 48, 7.3, 54, 9.0), baseline_rhr=53),
        },
        {
            "name": "Modified",
            "today": date(2026, 3, 24),
            "metric": _harness_metric("2026-03-24", 57, 7.2, 57, 13.4),
            "feedback": {"physical_feeling": "normal", "mental_feeling": "steady", "notes": ""},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 24), primary_adaptation="threshold"),
            "metrics": _harness_metrics_window(date(2026, 3, 24), _harness_metric("2026-03-24", 57, 7.2, 57, 13.4), baseline_rhr=53),
        },
        {
            "name": "Replaced",
            "today": date(2026, 3, 24),
            "metric": _harness_metric("2026-03-24", 42, 5.2, 58, 15.0),
            "feedback": {"physical_feeling": "injured", "mental_feeling": "drained", "notes": "calf tightness and tingling"},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 24), primary_adaptation="threshold"),
        },
    ]

    print("\nRecommendation Explanation Harness")
    for scenario in scenarios:
        today = scenario["today"]
        metric = scenario["metric"]
        feedback = scenario["feedback"]
        weekly_intent = scenario["weekly_intent"]
        metrics = scenario.get("metrics") or (SAMPLE_METRICS[:-1] + [metric])
        recommendation = deterministic_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            metrics,
            today=today,
            subjective_feedback=feedback,
            weekly_intent=weekly_intent,
            mode="conservative",
        )
        planned_workout = _build_planned_workout_payload(weekly_intent, SAMPLE_PROFILE, today)
        explanation = generate_recommendation_explanation(
            {
                "recommendation": recommendation,
                "plannedWorkout": planned_workout,
                "athleteName": SAMPLE_PROFILE.name,
            }
        )
        adaptation = recommendation.daily_adaptation or {}

        print(f"\n=== {scenario['name']} ===")
        print(f"recommendation summaryLabel: {adaptation.get('summary_label', recommendation.workout)}")
        print(f"planStatus: {adaptation.get('plan_status', '-')}")
        print(f"explanation source: {explanation.get('source', '-')}")
        print(f"summary: {explanation.get('summary', '-')}")
        print(f"whyBullets: {explanation.get('whyBullets', [])}")
        print(f"decisionDrivers: {explanation.get('decisionDrivers')}")
        print(f"cautionNote: {explanation.get('cautionNote')}")
        print(f"encouragement: {explanation.get('encouragement')}")


def print_detailed_reasoning_harness() -> None:
    scenarios = [
        {
            "name": "Preserved Low-Recovery Easy Day",
            "today": date(2026, 3, 23),
            "metric": _harness_metric("2026-03-23", 48, 7.3, 54, 9.0),
            "feedback": {"physical_feeling": "normal", "mental_feeling": "steady", "notes": ""},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 23)),
            "metrics": _harness_metrics_window(date(2026, 3, 23), _harness_metric("2026-03-23", 48, 7.3, 54, 9.0), baseline_rhr=53),
        },
        {
            "name": "Modified Hard Day To Easy",
            "today": date(2026, 3, 24),
            "metric": _harness_metric("2026-03-24", 57, 7.2, 57, 13.4),
            "feedback": {"physical_feeling": "normal", "mental_feeling": "steady", "notes": ""},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 24), primary_adaptation="threshold"),
            "metrics": _harness_metrics_window(date(2026, 3, 24), _harness_metric("2026-03-24", 57, 7.2, 57, 13.4), baseline_rhr=53),
        },
        {
            "name": "Replaced Recovery Day",
            "today": date(2026, 3, 24),
            "metric": _harness_metric("2026-03-24", 42, 5.2, 58, 15.0),
            "feedback": {"physical_feeling": "injured", "mental_feeling": "drained", "notes": "calf tightness and tingling"},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 24), primary_adaptation="threshold"),
        },
        {
            "name": "High-Readiness Preserved Quality Day",
            "today": date(2026, 3, 24),
            "metric": _harness_metric("2026-03-24", 86, 8.2, 52, 7.4),
            "feedback": {"physical_feeling": "fresh", "mental_feeling": "sharp", "notes": "felt good yesterday"},
            "weekly_intent": _scenario_weekly_intent(date(2026, 3, 24), primary_adaptation="threshold"),
        },
    ]

    print("\nDetailed Reasoning Harness")
    for scenario in scenarios:
        today = scenario["today"]
        metric = scenario["metric"]
        feedback = scenario["feedback"]
        weekly_intent = scenario["weekly_intent"]
        metrics = scenario.get("metrics") or (SAMPLE_METRICS[:-1] + [metric])
        recommendation = deterministic_recommendation(
            SAMPLE_PROFILE,
            SAMPLE_RUNS,
            metrics,
            today=today,
            subjective_feedback=feedback,
            weekly_intent=weekly_intent,
            mode="conservative",
        )
        planned_workout = _build_planned_workout_payload(weekly_intent, SAMPLE_PROFILE, today)
        explanation = generate_recommendation_explanation(
            {
                "recommendation": recommendation,
                "plannedWorkout": planned_workout,
                "athleteName": SAMPLE_PROFILE.name,
            }
        )

        print(f"\n=== {scenario['name']} ===")
        print(f"Coach Summary: {explanation.get('summary', '-')}")
        print("Detailed Reasoning:")
        print(f"- Overall: {recommendation.explanation_sections.get('overall', '')}")
        print(f"- Run Logic: {recommendation.explanation_sections.get('run', '')}")
        print(f"- Pace: {recommendation.explanation_sections.get('pace', '')}")
        print(f"- Lift Logic: {recommendation.explanation_sections.get('lift', '')}")
        print(f"- Recovery Influence: {recommendation.explanation_sections.get('recovery', '')}")
        print(f"- Warnings: {recommendation.warnings}")


if __name__ == "__main__":
    unittest.main()
