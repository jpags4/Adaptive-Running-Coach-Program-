from __future__ import annotations

import json
import os
from datetime import date

from coach import AthleteProfile, Recommendation, RecoveryMetrics, Run, coach_recommendation


def openai_enabled() -> bool:
    return bool(os.environ.get("OPENAI_API_KEY", "").strip())


def _recent_runs_payload(runs: list[Run], limit: int = 7) -> list[dict]:
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


def _recent_metrics_payload(metrics: list[RecoveryMetrics], limit: int = 5) -> list[dict]:
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


def llm_recommendation(
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    today: date | None = None,
) -> tuple[Recommendation, dict]:
    if not openai_enabled():
        fallback = coach_recommendation(profile, runs, metrics, today=today)
        return fallback, {"source": "deterministic", "model": None, "reason": "OPENAI_API_KEY not set"}

    try:
        from openai import OpenAI
    except Exception:
        fallback = coach_recommendation(profile, runs, metrics, today=today)
        return fallback, {"source": "deterministic", "model": None, "reason": "openai package not installed"}

    model = os.environ.get("OPENAI_MODEL", "gpt-5-mini").strip() or "gpt-5-mini"
    client = OpenAI()

    latest_metric = max(metrics, key=lambda item: item.day)
    context = {
        "athlete_profile": {
            "name": profile.name,
            "goal_race_date": profile.goal_race_date,
            "preferred_long_run_day": profile.preferred_long_run_day,
            "weekly_mileage_target": profile.weekly_mileage_target,
        },
        "recent_runs": _recent_runs_payload(runs),
        "recent_recovery_metrics": _recent_metrics_payload(metrics),
        "today": today.isoformat() if today else latest_metric.day,
        "training_philosophy": [
            "Cardio may be ahead of leg durability, so avoid overloading connective tissue.",
            "Use hills as built-in stress and be careful about stacking intensity.",
            "Prioritize easy running when sleep, recovery, or leg soreness suggest backing off.",
            "Include a practical lifting recommendation every day.",
            "The athlete cares more about recent activity and current recovery than about hitting a rigid weekly mileage target.",
            "Recommendations should feel like thoughtful coaching, not generic mileage formulas.",
        ],
    }

    developer_prompt = (
        "You are an adaptive running coach for a fit athlete training for a half marathon. "
        "Reason from recent training history and health metrics. "
        "Return a practical recommendation for today's run and lifting. "
        "Be especially careful about leg durability, fatigue from hills, poor sleep, elevated strain, "
        "and recent heavy running load. "
        "Do not anchor on arbitrary weekly mileage targets unless recent training data supports them. "
        "Use the athlete's recent runs, pace history, recovery, sleep, and strain as the main drivers. "
        "Give a concrete running prescription in mileage and rough pace, plus specific lifting guidance. "
        "Explain your reasoning in plain language. "
        "Do not mention uncertainty unless it materially changes the plan. "
        "Keep pace guidance rough and usable, not over-precise. "
        "Return valid JSON matching the provided schema."
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
            }
        )
        payload = _parse_response_json(response)
        recommendation = Recommendation(
            date=context["today"],
            workout=payload["workout"],
            intensity=payload["intensity"],
            duration_minutes=int(payload["duration_minutes"]),
            run_distance_miles=float(payload["run_distance_miles"]),
            run_pace_guidance=payload["run_pace_guidance"],
            lift_focus=payload["lift_focus"],
            lift_guidance=payload["lift_guidance"],
            recap=list(payload["recap"]),
            explanation=list(payload["explanation"]),
            warnings=list(payload["warnings"]),
            confidence=payload["confidence"],
        )
        return recommendation, {"source": "openai", "model": model, "reason": None}
    except Exception as exc:
        fallback = coach_recommendation(profile, runs, metrics, today=today)
        return fallback, {"source": "deterministic", "model": None, "reason": str(exc)}
