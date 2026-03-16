import unittest
from datetime import date
from unittest import mock

from app import projected_calendar_entries
from coach import coach_recommendation
from integrations import build_strava_authorize_url, build_whoop_authorize_url
from llm_coach import llm_recommendation
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


if __name__ == "__main__":
    unittest.main()
