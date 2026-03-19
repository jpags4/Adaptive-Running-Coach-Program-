from __future__ import annotations

import json
import os
from datetime import date

from coach import (
    AthleteProfile,
    Recommendation,
    RecoveryMetrics,
    Run,
    average_easy_pace,
    build_pace_model,
    coach_recommendation,
    build_weekly_intent,
    pace_window,
    parse_date,
    planned_session_for_day,
    recent_mileage,
    _reschedule_guidance,
    _weekly_goal_phrase,
)


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


def _average_resting_hr(metrics: list[RecoveryMetrics], days: int = 7) -> float:
    if not metrics:
        return 0.0

    latest_day = max(parse_date(item.day) for item in metrics)
    cutoff = latest_day.toordinal() - days + 1
    values = [item.resting_hr for item in metrics if parse_date(item.day).toordinal() >= cutoff]
    return round(sum(values) / len(values), 1) if values else 0.0


def _recent_longest_run(runs: list[Run], days: int = 21) -> float:
    if not runs:
        return 0.0

    latest_day = max(parse_date(item.day) for item in runs)
    cutoff = latest_day.toordinal() - days + 1
    eligible = [run.distance_miles for run in runs if parse_date(run.day).toordinal() >= cutoff]
    return max(eligible) if eligible else 0.0


def _recent_hard_run_count(runs: list[Run], today_str: str, days: int = 3) -> int:
    today_date = parse_date(today_str)
    return sum(
        1
        for run in runs
        if 0 < (today_date - parse_date(run.day)).days <= days and run.effort in {"hard", "very hard"}
    )


def _recent_high_strain_days(metrics: list[RecoveryMetrics], threshold: float = 12.0, days: int = 3) -> int:
    if not metrics:
        return 0

    latest_day = max(parse_date(item.day) for item in metrics)
    cutoff = latest_day.toordinal() - days + 1
    return sum(
        1
        for item in metrics
        if parse_date(item.day).toordinal() >= cutoff and item.strain >= threshold
    )


def _intensity_rank(value: str) -> int:
    text = str(value or "").strip().lower()
    if "rest" in text:
        return 0
    if "easy" in text or "very easy" in text:
        return 1
    if "moderate" in text or "steady" in text:
        return 2
    if "hard" in text or "tempo" in text or "interval" in text:
        return 3
    return 1


def _safety_and_progression_context(
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    today_str: str,
    subjective_feedback: dict | None,
) -> dict:
    latest_metric = max(metrics, key=lambda item: item.day) if metrics else None
    baseline_rhr = _average_resting_hr(metrics, days=7)
    recent_miles = recent_mileage(runs, days=7)
    longest_recent_run = _recent_longest_run(runs, days=21)
    hard_runs_last_3 = _recent_hard_run_count(runs, today_str, days=3)
    high_strain_days_last_3 = _recent_high_strain_days(metrics, threshold=12.0, days=3)
    easy_pace = average_easy_pace(runs)
    feedback = subjective_feedback or {}
    physical = str(feedback.get("physical_feeling") or "").strip().lower()
    mental = str(feedback.get("mental_feeling") or "").strip().lower()
    notes = str(feedback.get("notes") or "").strip().lower()
    illness_noted = any(
        token in notes
        for token in [
            "sick",
            "ill",
            "headache",
            "migraine",
            "fever",
            "chills",
            "nausea",
            "dizzy",
            "dizziness",
            "vomit",
            "stomach bug",
            "flu",
            "cold",
            "cough",
            "sore throat",
        ]
    )

    elevated_rhr = bool(latest_metric and baseline_rhr and latest_metric.resting_hr >= baseline_rhr + 4)
    severe_elevated_rhr = bool(latest_metric and baseline_rhr and latest_metric.resting_hr >= baseline_rhr + 7)

    return {
        "latest_recovery_score": latest_metric.recovery_score if latest_metric else 0,
        "latest_sleep_hours": latest_metric.sleep_hours if latest_metric else 0.0,
        "latest_strain": latest_metric.strain if latest_metric else 0.0,
        "baseline_resting_hr": baseline_rhr,
        "latest_resting_hr": latest_metric.resting_hr if latest_metric else 0,
        "elevated_resting_hr": elevated_rhr,
        "severely_elevated_resting_hr": severe_elevated_rhr,
        "recent_mileage_7_day": recent_miles,
        "weekly_mileage_target": profile.weekly_mileage_target,
        "recent_longest_run_21_day": longest_recent_run,
        "hard_runs_last_3_days": hard_runs_last_3,
        "high_strain_days_last_3_days": high_strain_days_last_3,
        "easy_pace_reference": pace_window(easy_pace, slower=0.7),
        "subjective_physical": physical,
        "subjective_mental": mental,
        "subjective_notes": notes,
        "illness_noted_in_checkin": illness_noted,
        "guardrails": [
            "If physical feedback says sick or the notes mention headache, fever, nausea, dizziness, flu-like symptoms, or feeling unwell, prescribe a rest day or very light walking only and no strength training.",
            "If recovery is below 35%, or sleep is below 5.5 hours, or resting heart rate is 7+ bpm above baseline, do not prescribe a hard workout.",
            "If recovery is below 50%, or sleep is below 6.0 hours, or resting heart rate is 4+ bpm above baseline, or heavy legs, soreness, stress, or mental fatigue are reported, downshift intensity. Sleep between 6.0 and 6.5 hours should only downshift when paired with mediocre recovery or other red flags.",
            "Do not prescribe a hard or tempo session if there was already a hard run in the last 3 days or multiple high-strain days in the last 3 days.",
            "Respect progression: avoid recommending a run more than about 10% longer than the athlete's recent longest run unless the race is close and the data strongly supports it.",
            "Prefer two rest or very low-strain days per week and cap lifting at three days per week unless there is an unusually strong reason not to.",
        ],
    }


def _apply_guardrails(
    recommendation: Recommendation,
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    subjective_feedback: dict | None = None,
) -> Recommendation:
    context = _safety_and_progression_context(profile, runs, metrics, recommendation.date, subjective_feedback)
    warnings = list(recommendation.warnings)
    explanation = list(recommendation.explanation)
    sections = dict(recommendation.explanation_sections)

    physical = context["subjective_physical"]
    mental = context["subjective_mental"]
    low_readiness = (
        context["latest_recovery_score"] < 50
        or context["latest_sleep_hours"] < 6.0
        or (context["latest_sleep_hours"] < 6.5 and context["latest_recovery_score"] < 45)
        or context["elevated_resting_hr"]
        or physical in {"heavy", "sore"}
        or mental in {"stressed", "drained"}
    )
    severe_block = (
        physical == "sick"
        or context["illness_noted_in_checkin"]
        or context["latest_recovery_score"] < 35
        or context["latest_sleep_hours"] < 5.5
        or context["severely_elevated_resting_hr"]
    )
    no_quality = low_readiness or context["hard_runs_last_3_days"] >= 1 or context["high_strain_days_last_3_days"] >= 2

    if severe_block:
        sections["overall"] = "Today is better used as a recovery day because your readiness signals and/or subjective feedback do not support training stress."
        sections["run"] = "The run was removed because the safest call today is rest or only very light movement."
        sections["pace"] = "No pace target today because the recommendation has been downshifted to rest."
        sections["lift"] = "Lifting is removed today so you can recover rather than stack more stress."
        sections["recovery"] = (
            f"Recovery {context['latest_recovery_score']}%, sleep {context['latest_sleep_hours']:.1f} h, "
            f"and your subjective check-in indicate training stress is not well supported today."
        )
        warnings.insert(0, "Guardrail triggered: today should be a rest or recovery-focused day, not a training day.")
        explanation.insert(0, "Guardrail: readiness is too low for productive training, so the plan was downshifted to recovery.")
        recommendation.workout = "Rest and recovery"
        recommendation.intensity = "rest"
        recommendation.duration_minutes = 0
        recommendation.run_distance_miles = 0.0
        recommendation.run_pace_guidance = "Rest day"
        recommendation.lift_focus = "No lifting"
        recommendation.lift_guidance = "Rest, walk lightly if you want, and use mobility or easy tissue work only if it feels restorative."
        recommendation.confidence = "high"
        recommendation.explanation = explanation
        recommendation.explanation_sections = sections
        recommendation.warnings = warnings
        return recommendation

    if no_quality and _intensity_rank(recommendation.intensity) >= 3:
        easy_pace = average_easy_pace(runs)
        recommendation.workout = "Easy aerobic run"
        recommendation.intensity = "easy"
        recommendation.duration_minutes = min(recommendation.duration_minutes, 45)
        recommendation.run_distance_miles = round(min(recommendation.run_distance_miles, max(3.0, profile.weekly_mileage_target * 0.16)), 1)
        recommendation.run_pace_guidance = pace_window(easy_pace, slower=0.8)
        recommendation.lift_focus = "Light durability work only"
        recommendation.lift_guidance = "Keep strength short and light today: 2-3 simple exercises, no grinding reps, and skip it entirely if the legs feel worse during warm-up."
        warnings.insert(0, "Guardrail triggered: higher-intensity work was downgraded because your recent load/readiness does not support a hard day.")
        explanation.insert(0, "Guardrail: this was reduced to an easy day because stacked strain or low readiness makes a hard session risky.")
        sections["overall"] = "This day was downshifted to easy because your current readiness and recent load do not support quality work safely."
        sections["pace"] = f"The pace was reset to an easy aerobic band of {recommendation.run_pace_guidance} so the work stays controlled."
        sections["lift"] = recommendation.lift_guidance

    lift_off_day = (
        low_readiness
        or context["hard_runs_last_3_days"] >= 1
        or context["high_strain_days_last_3_days"] >= 2
        or recommendation.run_distance_miles >= profile.weekly_mileage_target * 0.22
        or _intensity_rank(recommendation.intensity) >= 2
    )
    if lift_off_day:
        recommendation.lift_focus = "Today is a lifting off-day"
        recommendation.lift_guidance = "Today is a lifting off-day."
        sections["lift"] = "Today is a lifting off-day so the run can stand on its own without adding extra fatigue."

    longest_recent_run = context["recent_longest_run_21_day"]
    target_cap = profile.weekly_mileage_target * 0.35
    recent_cap = longest_recent_run * 1.10 if longest_recent_run else max(4.0, profile.weekly_mileage_target * 0.18)
    max_safe_distance = round(max(3.0, min(target_cap, recent_cap)), 1)

    if recommendation.run_distance_miles > max_safe_distance:
        original_distance = recommendation.run_distance_miles
        recommendation.run_distance_miles = max_safe_distance
        warnings.append(
            f"Progression guardrail: today's run was capped at {max_safe_distance:.1f} miles to stay closer to your recent training history."
        )
        explanation.append(
            f"Progression guardrail: volume was capped from {original_distance:.1f} to {max_safe_distance:.1f} miles to avoid jumping too far beyond your recent longest run."
        )
        sections["run"] = (
            f"Today's run was capped at {max_safe_distance:.1f} miles so progression stays controlled relative to your recent long run history."
        )

    recommendation.explanation = explanation
    recommendation.explanation_sections = sections
    recommendation.warnings = warnings
    return recommendation


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
    weekly_intent=None,
) -> tuple[Recommendation, dict]:
    if today is None:
        if metrics:
            today_value = parse_date(max(metrics, key=lambda item: item.day).day)
        else:
            today_value = date.today()
    else:
        today_value = today

    weekly_intent = weekly_intent or build_weekly_intent(profile, runs, metrics, today=today_value)
    recommendation = coach_recommendation(
        profile,
        runs,
        metrics,
        today=today_value,
        subjective_feedback=None,
        weekly_intent=weekly_intent,
    )
    recommendation.warnings.insert(0, "Model fallback: using deterministic coach logic because the language model was unavailable.")
    recommendation.warnings.insert(1, reason)
    recommendation.confidence = "medium" if recommendation.confidence == "high" else recommendation.confidence
    recommendation.explanation.insert(0, "The model was unavailable, so this uses the app's built-in coach logic to keep today's plan useful and aligned with the week.")
    recommendation.explanation_sections["overall"] = "The language model was unavailable, so the app used its built-in coaching rules to keep today's recommendation useful."
    recommendation.explanation_sections["recovery"] = (
        recommendation.explanation_sections.get("recovery")
        or "The fallback still used your recent recovery data and weekly plan to shape the day."
    )
    recommendation.daily_adaptation = {
        **dict(recommendation.daily_adaptation or {}),
        "weekly_goal_remains": _weekly_goal_phrase(weekly_intent),
        "reschedule_suggestion": _reschedule_guidance(
            weekly_intent,
            str((recommendation.daily_adaptation or {}).get("readiness_status") or "supported"),
        ),
    }
    return recommendation, {"source": "unavailable", "model": None, "reason": reason}


def llm_recommendation(
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    today: date | None = None,
    subjective_feedback: dict | None = None,
    weekly_intent=None,
) -> tuple[Recommendation, dict]:
    if not openai_enabled():
        return _model_unavailable_recommendation(
            profile,
            runs,
            metrics,
            "OPENAI_API_KEY not set",
            today=today,
            weekly_intent=weekly_intent,
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
            weekly_intent=weekly_intent,
        )

    model = os.environ.get("OPENAI_MODEL", "gpt-5-mini").strip() or "gpt-5-mini"
    client = OpenAI()

    latest_metric = max(metrics, key=lambda item: item.day)
    today_str = today.isoformat() if today else latest_metric.day
    today_value = parse_date(today_str)
    weekly_intent = weekly_intent or build_weekly_intent(profile, runs, metrics, today=today_value)
    planned = planned_session_for_day(weekly_intent, profile, today_value)
    pace_model = build_pace_model(profile, runs)
    safety_context = _safety_and_progression_context(profile, runs, metrics, today_str, subjective_feedback)
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
        "weekly_intent": weekly_intent.to_dict(),
        "planned_session_today": planned,
        "pace_model": pace_model.to_dict(),
        "safety_and_progression_context": safety_context,
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
            "Some days should be run-only days. Do not force a lift recommendation every day; when strength is not appropriate, say clearly that today is a lifting off-day.",
            "If subjective feedback is provided, weight it meaningfully. Physical soreness, heavy legs, low motivation, or emotional stress should reduce risk and ambition even when biometric data looks decent.",
            "Use explicit safety and progression rules, not only style preferences. The final system should be grounded in guardrails that prevent aggressive recommendations on poor-readiness days.",
            "Start from the weekly plan. First decide what was planned for today, then decide whether readiness supports keeping it, scaling it down, or swapping it out while preserving the week's purpose.",
            "When you adapt today's plan, explicitly preserve the weekly intent in the wording so the athlete understands what changed and what did not.",
            "Use the pace model anchors instead of inventing one generic pace from a single easy-pace estimate.",
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
        "Follow the safety and progression context strictly. "
        "Use explicit guardrails: poor readiness, sickness, sore legs, elevated resting heart rate, poor sleep, or stacked hard days must downshift the recommendation. "
        "Progress mileage conservatively and avoid jumps that exceed recent training unless there is a compelling race-specific reason. "
        "Recommendations should be concrete and personalized, not generic. "
        "Explain the logic behind each major piece of the day in plain English. "
        "Your explanation_sections object must separately explain: "
        "overall why this day fits, why the run distance is set where it is, why the pace guidance is set where it is, "
        "why the lifting recommendation is set where it is, and how recovery metrics changed the recommendation. "
        "Treat the provided weekly_intent and planned_session_today as the starting plan for the day. "
        "If readiness supports it, keep the plan. If readiness partly supports it, scale it down. If not, swap or rest while protecting the week's key purpose. "
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
            planned_workout=str(planned["workout"]),
            planned_run_distance_miles=float(planned["distance_miles"]),
            planned_pace_guidance=str(planned["pace_guidance"]),
            pace_model=pace_model.to_dict(),
            weekly_intent=weekly_intent.to_dict(),
        )
        recommendation = _apply_guardrails(
            recommendation,
            profile,
            runs,
            metrics,
            subjective_feedback=subjective_feedback,
        )
        readiness_status = "supported"
        if recommendation.workout == "Rest and recovery":
            readiness_status = "not supported"
        elif recommendation.workout != recommendation.planned_workout:
            readiness_status = "partly supported"
        recommendation.daily_adaptation = {
            "planned_session": recommendation.planned_workout or str(planned["workout"]),
            "readiness_status": readiness_status,
            "adjustment_reason": recommendation.explanation_sections.get("overall") or "",
            "adjusted_session": recommendation.workout,
            "weekly_goal_remains": _weekly_goal_phrase(weekly_intent),
            "reschedule_suggestion": _reschedule_guidance(weekly_intent, readiness_status),
        }
        return recommendation, {"source": "openai", "model": model, "reason": None}
    except Exception as exc:
        return _model_unavailable_recommendation(
            profile,
            runs,
            metrics,
            f"OpenAI request failed: {exc}",
            today=today,
            weekly_intent=weekly_intent,
        )
