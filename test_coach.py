import unittest
from datetime import date

from coach import coach_recommendation
from integrations import build_strava_authorize_url, build_whoop_authorize_url
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


if __name__ == "__main__":
    unittest.main()
