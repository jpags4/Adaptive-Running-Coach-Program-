import unittest
from datetime import date
from unittest import mock

from app import _generate_weekly_plan, projected_calendar_entries
from coach import Recommendation, coach_recommendation
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
        self.assertEqual(recommendation.workout, "Recommendation unavailable")
        self.assertIn("OPENAI_API_KEY not set", recommendation.warnings)
        self.assertIn("overall", recommendation.explanation_sections)

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
