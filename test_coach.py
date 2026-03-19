import unittest
from datetime import date
from unittest import mock

from app import (
    _apply_clarification_answers_to_settings,
    _generate_weekly_plan,
    _profile_settings_payload,
    build_training_roadmap,
    calendar_days,
    projected_calendar_entries,
)
from storage import load_tokens
from coach import (
    AthleteProfile,
    Recommendation,
    assess_recommendation_uncertainty,
    build_pace_model,
    build_recommendation_options,
    build_weekly_intent,
    coach_recommendation,
)
from integrations import build_strava_authorize_url, build_whoop_authorize_url
from llm_coach import _apply_guardrails, llm_recommendation
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
            for iso_day, activities in plan.items()
            if iso_day > "2026-03-14"
            for activity in activities
            if activity.get("name") == "Run"
        ]

        self.assertTrue(future_runs)

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


if __name__ == "__main__":
    unittest.main()
