from __future__ import annotations

import json
import os
from datetime import date

from coach import AthleteProfile, Recommendation, RecoveryMetrics, Run, recent_mileage


def openai_enabled() -> bool:
    return bool(os.environ.get("OPENAI_API_KEY", "").strip())


def _recent_runs_payload(runs: list[Run], limit: int = 10) -> list[dict]:
    ordered = sorted(runs, key=lambda item: item.day, reverse=True)[:limit]
    return [
        {
            "day": run.day,
            "distance_miles": run.distance_miles,
            "duration_minutes": run.duration_minutes,
            "average_pace_min_per_mile": run.average_pace_min_per_mile,
            "effort": run.effort,
            "workout_type": run.workout_type,
            "source": run.source,
        }
        for run in ordered
    ]


def _recent_metrics_payload(metrics: list[RecoveryMetrics], limit: int = 7) -> list[dict]:
    ordered = sorted(metrics, key=lambda item: item.day, reverse=True)[:limit]
    return [
        {
            "day": metric.day,
            "recovery_score": metric.recovery_score,
            "sleep_hours": metric.sleep_hours,
            "resting_hr": metric.resting_hr,
            "hrv_ms": metric.hrv_ms,
            "strain": metric.strain,
        }
        for metric in ordered
    ]


def _latest_run_summary(runs: list[Run]) -> dict:
    if not runs:
        return {
            "day": "",
            "distance_miles": 0.0,
            "duration_minutes": 0,
            "average_pace_min_per_mile": 0.0,
            "effort": "",
            "workout_type": "",
        }

    latest = max(runs, key=lambda item: item.day)
    return {
        "day": latest.day,
        "distance_miles": latest.distance_miles,
        "duration_minutes": latest.duration_minutes,
        "average_pace_min_per_mile": latest.average_pace_min_per_mile,
        "effort": latest.effort,
        "workout_type": latest.workout_type,
    }


def _recommendation_schema() -> dict:
    return {
        "type": "object",
        "properties": {
            "workout": {"type": "string"},
            "intensity": {"type": "string"},
            "duration_minutes": {"type": "integer"},
            "run_distance_miles": {"type": "number"},
            "run_pace_guidance": {"type": "string"},
            "lift_focus": {"type": "string"},
            "lift_guidance": {"type": "string"},
            "recap": {"type": "array", "items": {"type": "string"}},
            "explanation": {"type": "array", "items": {"type": "string"}},
            "explanation_sections": {
                "type": "object",
                "properties": {
                    "overall": {"type": "string"},
                    "run": {"type": "string"},
                    "pace": {"type": "string"},
                    "lift": {"type": "string"},
                    "recovery": {"type": "string"},
                },
                "required": ["overall", "run", "pace", "lift", "recovery"],
                "additionalProperties": False,
            },
            "warnings": {"type": "array", "items": {"type": "string"}},
            "confidence": {"type": "string"},
        },
        "required": [
            "workout",
            "intensity",
            "duration_minutes",
            "run_distance_miles",
            "run_pace_guidance",
            "lift_focus",
            "lift_guidance",
            "recap",
            "explanation",
            "explanation_sections",
            "warnings",
            "confidence",
        ],
        "additionalProperties": False,
    }


def _parse_response_json(response) -> dict:
    output_text = getattr(response, "output_text", "")
    if output_text:
        return json.loads(output_text)

    if hasattr(response, "model_dump"):
        dumped = response.model_dump()
        text_value = dumped.get("output_text")
        if text_value:
            return json.loads(text_value)

    raise ValueError("OpenAI response did not include structured JSON output.")


def _fallback_recap(profile: AthleteProfile, runs: list[Run], metrics: list[RecoveryMetrics]) -> list[str]:
    latest_run = _latest_run_summary(runs)
    latest_metrics = max(metrics, key=lambda item: item.day) if metrics else None
    recap = []
    if latest_run["day"]:
        recap.append(
            f"Most recent run: {latest_run['distance_miles']:.1f} miles in {latest_run['duration_minutes']} minutes."
        )
    recap.append(f"Seven-day running total: {recent_mileage(runs):.1f} miles.")
    if latest_metrics:
        recap.append(
            f"Latest WHOOP: recovery {latest_metrics.recovery_score}%, sleep {latest_metrics.sleep_hours:.1f} hours, strain {latest_metrics.strain:.1f}."
        )
    recap.append(f"Goal race date: {profile.goal_race_date}.")
    return recap


def _model_unavailable_recommendation(
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    reason: str,
    today: date | None = None,
) -> tuple[Recommendation, dict]:
    if today is None:
        if metrics:
            today_str = max(metrics, key=lambda item: item.day).day
        else:
            today_str = date.today().isoformat()
    else:
        today_str = today.isoformat()

    explanation_sections = {
        "overall": "The app could not get a model-generated recommendation right now.",
        "run": "Run details are unavailable because the language model did not return a valid coaching plan.",
        "pace": "Pace guidance is unavailable until the model responds successfully.",
        "lift": "Lifting guidance is unavailable until the model responds successfully.",
        "recovery": "Recovery metrics may still be loading, but the recommendation engine itself did not finish.",
    }
    recommendation = Recommendation(
        date=today_str,
        workout="Recommendation unavailable",
        intensity="unavailable",
        duration_minutes=0,
        run_distance_miles=0.0,
        run_pace_guidance="Unavailable until the model responds",
        lift_focus="Unavailable until the model responds",
        lift_guidance="No lifting recommendation is available right now because the model did not complete.",
        recap=_fallback_recap(profile, runs, metrics),
        explanation=list(explanation_sections.values()),
        explanation_sections=explanation_sections,
        warnings=[
            "The app is currently relying on the language model for recommendations and did not receive a usable response.",
            reason,
        ],
        confidence="unavailable",
    )
    return recommendation, {"source": "unavailable", "model": None, "reason": reason}


def llm_recommendation(
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    today: date | None = None,
    subjective_feedback: dict | None = None,
) -> tuple[Recommendation, dict]:
    if not openai_enabled():
        return _model_unavailable_recommendation(
            profile,
            runs,
            metrics,
            "OPENAI_API_KEY not set",
            today=today,
        )

    try:
        from openai import OpenAI
    except Exception:
        return _model_unavailable_recommendation(
            profile,
            runs,
            metrics,
            "openai package not installed",
            today=today,
        )

    model = os.environ.get("OPENAI_MODEL", "gpt-5-mini").strip() or "gpt-5-mini"
    client = OpenAI()

    latest_metric = max(metrics, key=lambda item: item.day)
    today_str = today.isoformat() if today else latest_metric.day
    context = {
        "athlete_profile": {
            "name": profile.name,
            "goal_race_date": profile.goal_race_date,
            "preferred_long_run_day": profile.preferred_long_run_day,
            "weekly_mileage_target": profile.weekly_mileage_target,
        },
        "recent_runs": _recent_runs_payload(runs),
        "recent_recovery_metrics": _recent_metrics_payload(metrics),
        "latest_run_summary": _latest_run_summary(runs),
        "today": today_str,
        "subjective_feedback": subjective_feedback or {},
        "coach_preferences": [
            "The recommendation engine should rely on the language model as the source of reasoning rather than earlier hand-written coach logic.",
            "Use a readiness -> load -> specifics reasoning flow: first decide how hard today should be, then account for recent accumulated strain, then shape the actual run and lift details.",
            "Every recommendation should explain why the run distance is what it is, why the pace is what it is, why the lifting recommendation is what it is, and how recovery metrics changed the plan.",
            "Leg durability is often a bigger limiter than cardio, especially on hilly terrain.",
            "The athlete wants recommendations that feel individualized and grounded in recent activity, not rigid mileage templates.",
            "Poor sleep, emotional stress, hills, and lingering soreness should meaningfully shape the recommendation.",
            "When the athlete is ready for a bigger day, say so clearly instead of defaulting conservative.",
            "Across a normal half marathon week, the athlete wants meaningful variance between easy runs, quality work, and a long run instead of nearly identical daily mileage.",
            "Weekly structure should usually include at least two low-strain or rest days and no more than three lifting days unless the data strongly justifies otherwise.",
            "If subjective feedback is provided, weight it meaningfully. Physical soreness, heavy legs, low motivation, or emotional stress should reduce risk and ambition even when biometric data looks decent.",
        ],
    }

    developer_prompt = (
        "You are the primary coaching engine for an adaptive running coach app. "
        "You must produce the training recommendation yourself from the athlete data provided. "
        "Do not imitate or defer to earlier rule-based logic. "
        "Return a specific run plan, rough pace guidance, and lifting plan for today. "
        "Reason carefully from recent training, recent pace history, WHOOP recovery metrics, sleep, strain, and likely leg durability. "
        "The athlete often has more cardio fitness than leg durability, and hills create extra muscular load. "
        "If subjective feedback is present, treat it as real signal rather than optional color. "
        "Recommendations should be concrete and personalized, not generic. "
        "Explain the logic behind each major piece of the day in plain English. "
        "Your explanation_sections object must separately explain: "
        "overall why this day fits, why the run distance is set where it is, why the pace guidance is set where it is, "
        "why the lifting recommendation is set where it is, and how recovery metrics changed the recommendation. "
        "The explanation array should be a concise bullet-style version of those same ideas. "
        "The recap should summarize the most relevant recent work and current readiness. "
        "Keep the pace guidance rough and human-usable, not over-precise. "
        "Return valid JSON matching the schema."
    )

    try:
        response = client.responses.create(
            model=model,
            input=[
                {"role": "developer", "content": developer_prompt},
                {"role": "user", "content": json.dumps(context)},
            ],
            text={
                "format": {
                    "type": "json_schema",
                    "name": "daily_training_recommendation",
                    "schema": _recommendation_schema(),
                    "strict": True,
                }
            },
        )
        payload = _parse_response_json(response)
        recommendation = Recommendation(
            date=today_str,
            workout=payload["workout"],
            intensity=payload["intensity"],
            duration_minutes=int(payload["duration_minutes"]),
            run_distance_miles=float(payload["run_distance_miles"]),
            run_pace_guidance=payload["run_pace_guidance"],
            lift_focus=payload["lift_focus"],
            lift_guidance=payload["lift_guidance"],
            recap=list(payload["recap"]),
            explanation=list(payload["explanation"]),
            explanation_sections=dict(payload["explanation_sections"]),
            warnings=list(payload["warnings"]),
            confidence=payload["confidence"],
        )
        return recommendation, {"source": "openai", "model": model, "reason": None}
    except Exception as exc:
        return _model_unavailable_recommendation(
            profile,
            runs,
            metrics,
            f"OpenAI request failed: {exc}",
            today=today,
        )
