from __future__ import annotations

import json
import os
import re
from datetime import date

from coach import (
    AthleteProfile,
    Recommendation,
    RecoveryMetrics,
    Run,
    _build_planned_workout_payload,
    adaptive_weekly_reference,
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
    deterministic_recommendation,
)


def openai_enabled() -> bool:
    return bool(os.environ.get("OPENAI_API_KEY", "").strip())


def _word_count(text: str) -> int:
    return len([token for token in str(text or "").strip().split() if token])


def _parse_pace_text_range_value(value: str) -> dict | None:
    text = str(value or "").strip()
    match = re.match(r"^(\d+:\d{2})-(\d+:\d{2})/mi$", text)
    if not match:
        return None
    return {"min": match.group(1), "max": match.group(2)}


def _metric_snapshot(recommendation: Recommendation) -> dict[str, float | int | None]:
    recap_line = str((recommendation.recap or [""])[0] or "")
    recovery_match = re.search(r"recovery\s+(\d+)%", recap_line, re.IGNORECASE)
    sleep_match = re.search(r"sleep\s+([0-9]+(?:\.[0-9]+)?)\s+hours", recap_line, re.IGNORECASE)
    strain_match = re.search(r"strain\s+([0-9]+(?:\.[0-9]+)?)", recap_line, re.IGNORECASE)
    return {
        "recovery": int(recovery_match.group(1)) if recovery_match else None,
        "sleep": float(sleep_match.group(1)) if sleep_match else None,
        "strain": float(strain_match.group(1)) if strain_match else None,
    }


def _recommendation_explanation_payload(inputs: dict) -> dict:
    recommendation = inputs["recommendation"]
    planned_workout = inputs["plannedWorkout"]
    adaptation = dict(recommendation.daily_adaptation or {})
    flags = dict(adaptation.get("flags") or {})
    pain = dict(adaptation.get("pain") or {})
    run = dict(adaptation.get("run") or {})
    lift = dict(adaptation.get("lift") or {})
    return {
        "athleteName": inputs.get("athleteName"),
        "plannedWorkout": {
            "label": str(planned_workout.get("label") or ""),
            "type": str(planned_workout.get("type") or ""),
            "plannedMiles": planned_workout.get("plannedMiles"),
            "plannedPaceRange": planned_workout.get("paceRange"),
        },
        "recommendation": {
            "summaryLabel": str(adaptation.get("summary_label") or recommendation.workout or ""),
            "planStatus": str(adaptation.get("plan_status") or "modified"),
            "planStatusLabel": str(adaptation.get("plan_status_label") or "Adjusted"),
            "readinessScore": int(adaptation.get("readiness_score") or 0),
            "readinessTier": str(adaptation.get("readiness_tier") or ""),
            "decision": str(adaptation.get("decision") or ""),
            "run": {
                "modality": str(run.get("modality") or adaptation.get("primary_modality") or recommendation.primary_modality or "run"),
                "shouldRun": bool(run.get("shouldRun")),
                "label": str(run.get("label") or recommendation.workout or ""),
                "miles": run.get("miles"),
                "durationMin": run.get("durationMin"),
                "paceRange": run.get("paceRange") or _parse_pace_text_range_value(recommendation.run_pace_guidance),
                "intensity": str(run.get("intensity") or recommendation.intensity or ""),
                "bikeZone": str(run.get("bikeZone") or recommendation.bike_zone or ""),
                "bikeCadence": str(run.get("bikeCadence") or recommendation.bike_cadence or ""),
                "notes": list(run.get("notes") or recommendation.endurance_notes or []),
            },
            "lift": {
                "shouldLift": bool(lift.get("shouldLift")),
                "label": str(lift.get("label") or recommendation.lift_focus or ""),
                "guidance": list(lift.get("guidance") or ([recommendation.lift_guidance] if recommendation.lift_guidance else [])),
            },
            "flags": flags,
            "pain": pain,
            "metricSnapshot": _metric_snapshot(recommendation),
            "reasoning": {
                "rationaleTags": list(adaptation.get("rationale_tags") or []),
                "runLogic": list(recommendation.explanation_sections.get("run", "").split(". ")) if recommendation.explanation_sections.get("run") else [],
                "recoveryInfluence": list(recommendation.warnings or []),
                "planProtection": [recommendation.explanation_sections.get("recovery")] if recommendation.explanation_sections.get("recovery") else [],
            },
        },
    }


def build_explanation_prompt(inputs: dict) -> dict[str, str]:
    payload = _recommendation_explanation_payload(inputs)
    planned = payload["plannedWorkout"]
    rec = payload["recommendation"]
    system = (
        "You are a concise running coach writing athlete-facing explanations for a training recommendation. "
        "The recommendation is already final. Do not change the workout. Do not add medical advice. "
        "Do not invent facts. Be concise, clear, and coach-like."
    )
    user = (
        "Planned workout:\n"
        f"- label: {planned['label']}\n"
        f"- type: {planned['type']}\n"
        f"- planned miles: {planned['plannedMiles']}\n"
        f"- planned pace range: {json.dumps(planned['plannedPaceRange'])}\n\n"
        "Final recommendation:\n"
        f"- summary label: {rec['summaryLabel']}\n"
        f"- plan status: {rec['planStatus']}\n"
        f"- readiness score: {rec['readinessScore']}\n"
        f"- readiness tier: {rec['readinessTier']}\n"
        f"- decision: {rec['decision']}\n\n"
        "Key metrics:\n"
        f"- metricSnapshot: {json.dumps(rec['metricSnapshot'])}\n\n"
        "Pain check-in:\n"
        f"- {json.dumps(rec['pain'])}\n\n"
        "Run:\n"
        f"- modality: {rec['run']['modality']}\n"
        f"- shouldRun: {rec['run']['shouldRun']}\n"
        f"- label: {rec['run']['label']}\n"
        f"- miles: {rec['run']['miles']}\n"
        f"- durationMin: {rec['run']['durationMin']}\n"
        f"- paceRange: {json.dumps(rec['run']['paceRange'])}\n"
        f"- intensity: {rec['run']['intensity']}\n\n"
        f"- bikeZone: {rec['run']['bikeZone']}\n"
        f"- bikeCadence: {rec['run']['bikeCadence']}\n"
        "Lift:\n"
        f"- shouldLift: {rec['lift']['shouldLift']}\n"
        f"- label: {rec['lift']['label']}\n"
        f"- guidance: {json.dumps(rec['lift']['guidance'])}\n\n"
        "Reasoning tags:\n"
        f"- {json.dumps(rec['reasoning']['rationaleTags'])}\n\n"
        "Run logic:\n"
        f"- {json.dumps(rec['reasoning']['runLogic'])}\n\n"
        "Recovery influence:\n"
        f"- {json.dumps(rec['reasoning']['recoveryInfluence'])}\n\n"
        "Plan protection:\n"
        f"- {json.dumps(rec['reasoning']['planProtection'])}\n\n"
        "Write JSON with this schema only:\n"
        "{\n"
        '  "summary": "2-4 sentences max",\n'
        '  "whyBullets": ["short bullet", "short bullet"],\n'
        '  "decisionDrivers": "1-2 short sentences or null",\n'
        '  "cautionNote": "optional short note or null",\n'
        '  "encouragement": "optional short line or null"\n'
        "}\n\n"
        "Rules:\n"
        "- Do not change the prescription.\n"
        "- Do not mention every metric.\n"
        "- Mention only the most important reasons.\n"
        "- Keep it under 120 words total.\n"
        "- Include one compact decisionDrivers sentence that names the key signals behind the final call.\n"
        "- If the session is preserved, make that explicit.\n"
        "- If the session is modified, explain the change plainly.\n"
        "- If the session is replaced, explain that recovery takes priority today.\n"
    )
    return {"system": system, "user": user}


def _decision_drivers_text(payload: dict) -> str:
    rec = payload["recommendation"]
    flags = dict(rec["flags"] or {})
    pain = dict(rec.get("pain") or {})
    metric_snapshot = dict(rec.get("metricSnapshot") or {})
    recovery = metric_snapshot.get("recovery")
    strain = metric_snapshot.get("strain")
    plan_status = str(rec.get("planStatus") or "modified")
    planned_label = str(payload["plannedWorkout"].get("label") or "the planned session").lower()
    final_label = str(rec.get("summaryLabel") or rec["run"].get("label") or "the final session").lower()
    lift_label = str(rec["lift"].get("label") or "").lower()
    modality = str(rec["run"].get("modality") or "run").lower()
    low_risk_same_day = plan_status == "preserved" and final_label in {"easy run", "recovery run"} or "easy" in planned_label

    if flags.get("injuryOverride") or flags.get("forceRestOrCrossTrain"):
        return "Decision drivers: Pain or injury signals took priority over the plan, so training stress was removed for today."

    if modality == "bike":
        if plan_status == "replaced":
            return "Decision drivers: Pain is present with running, but the day's training goal can still be supported with lower-impact aerobic work, so the recommendation shifts from running to biking."
        return "Decision drivers: Pain changed the impact cost of running, so the day was moved to the bike to preserve aerobic work more safely."

    if pain.get("hasPain") and pain.get("painWithRunning") and str(pain.get("painLocation") or "") in {"hip", "low_back", "hamstring", "quad", "other"}:
        return "Decision drivers: Pain is present with running, and biking was not assumed to be the better substitute for this area, so recovery takes priority today."

    if plan_status == "replaced":
        if recovery is not None and recovery < 50:
            return f"Decision drivers: Recovery came in at {recovery}%, below your 50% threshold, and the rest of the signals did not justify training stress, so the session was replaced with recovery."
        return "Decision drivers: The current recovery and caution signals did not justify training stress, so the session was replaced with recovery."

    if plan_status == "modified":
        if flags.get("highStrainCaution") and flags.get("elevatedHrCaution"):
            return "Decision drivers: Elevated resting HR and recent load stacked enough caution to remove intensity, so the session shifted to an easy run."
        if recovery is not None and recovery < 50:
            return f"Decision drivers: Recovery came in at {recovery}%, below your 50% threshold, so the original session was eased down to keep training moving without forcing intensity."
        if flags.get("mentalDownshift"):
            return "Decision drivers: Subjective fatigue lowered the ceiling for the day, so the session was trimmed back to keep the work productive."
        return "Decision drivers: The original session carried more stress than today's signals supported, so the day was downshifted to keep useful work in place."

    if recovery is not None and recovery < 50 and low_risk_same_day:
        lift_clause = ""
        if lift_label in {"core only", "no lift today"}:
            lift_clause = f" {rec['lift']['label']} keeps extra stress from stacking."
        return f"Decision drivers: Recovery came in at {recovery}%, below your 50% threshold, but the planned session was already easy and low-risk enough to keep.{lift_clause}"
    if rec.get("readinessTier") == "high" and not any([flags.get("highStrainCaution"), flags.get("elevatedHrCaution"), flags.get("mentalDownshift")]):
        return "Decision drivers: Recovery, sleep, and your subjective check-in all supported the planned work, so no adjustment was needed."
    if flags.get("highStrainCaution") and strain is not None:
        return f"Decision drivers: Recent load was elevated with strain at {strain:.1f}, so the session stayed controlled even though it remained on the plan."
    return "Decision drivers: The final recommendation reflects the strongest current recovery and readiness signals without adding stress the day does not need."


def build_template_fallback_explanation(inputs: dict) -> dict:
    payload = _recommendation_explanation_payload(inputs)
    rec = payload["recommendation"]
    flags = dict(rec["flags"] or {})
    plan_status = str(rec["planStatus"] or "modified")
    planned_label = str(payload["plannedWorkout"].get("label") or "").strip()
    final_label = str(rec.get("summaryLabel") or "").strip()
    readiness_tier = str(rec.get("readinessTier") or "").strip().lower()
    modality = str(rec.get("run", {}).get("modality") or "run").strip().lower()
    rationale_tags = set(rec.get("reasoning", {}).get("rationaleTags") or [])
    recovery_influence = list(rec.get("reasoning", {}).get("recoveryInfluence") or [])
    preserved_caution = bool(
        recovery_influence
        or flags.get("highStrainCaution")
        or flags.get("elevatedHrCaution")
        or flags.get("mentalDownshift")
        or "protect_key_session" in rationale_tags
        or "protect_week_structure" in rationale_tags
    )
    caution_note = None
    if flags.get("injuryOverride") or flags.get("forceRestOrCrossTrain"):
        caution_note = "Back off today and reassess before returning to normal training."
    elif plan_status == "preserved" and preserved_caution:
        caution_note = "This session stays in place, but the goal is to stay comfortably within the intended effort."
    elif plan_status != "preserved" and (flags.get("highStrainCaution") or flags.get("elevatedHrCaution")):
        caution_note = "Recent load and recovery signals both point toward keeping today lighter."

    decision_drivers = _decision_drivers_text(payload)

    if modality == "bike":
        summary = "Running is off the table today, but you can still get useful aerobic work in on the bike. Because the pain appears tied to impact and not general movement, a controlled spin is the better option."
        if planned_label:
            summary = f"{planned_label} gives way to the bike today. Because the pain appears tied to impact and not general movement, a controlled spin is the better option."
        return {
            "summary": summary,
            "whyBullets": [
                "The goal is to keep aerobic work without the impact of running.",
                "The ride should stay smooth and controlled, not turn into a hard replacement workout.",
            ],
            "decisionDrivers": decision_drivers,
            "cautionNote": "Keep the ride smooth and stop if the same area becomes painful on the bike.",
            "encouragement": "Use the bike to keep momentum, not to force fitness.",
            "source": "template_fallback",
        }

    if plan_status == "preserved":
        if readiness_tier == "high" and not preserved_caution:
            summary = "Today is a good day to keep the planned session in place. Readiness is strong and the current signals support the work as written."
            if planned_label:
                summary = f"Today is a good day to keep {planned_label.lower()} in place. Readiness is strong and the current signals support the work as written."
            why_bullets = [
                "The session is supported today.",
                "Current signals do not require a change.",
            ]
        elif run_is_low_risk := final_label.lower() in {"easy run", "recovery run"} or str(rec.get("decision") or "") == "maintain":
            summary = "The planned session still makes sense today, but this should stay controlled. Recovery is not ideal, though the workout is light enough to keep in place."
            if planned_label:
                summary = f"The planned session still makes sense today, and {planned_label.lower()} can stay in place, but this should stay controlled."
            why_bullets = [
                "The workout stays in place because it already fits the day.",
                "Keep the effort controlled even though the plan stays the same.",
            ]
        else:
            summary = "We’re leaving the session unchanged, but the goal is still to keep the day measured. That keeps the week on track without adding unnecessary stress."
            if planned_label:
                summary = f"We’re leaving {planned_label.lower()} unchanged, but the goal is still to keep the day measured."
            why_bullets = [
                "The session still fits today.",
                "Keep the effort controlled and measured.",
            ]
        return {
            "summary": summary,
            "whyBullets": why_bullets,
            "decisionDrivers": decision_drivers,
            "cautionNote": caution_note,
            "encouragement": "Let the day stay smooth and controlled from the start." if preserved_caution else "Settle in early, then let the session come to you.",
            "source": "template_fallback",
        }
    if plan_status == "replaced":
        summary = "Today shifts away from the original session. Recovery is the better play here, and backing off now gives the rest of the week a better chance to land well."
        if planned_label:
            summary = f"{planned_label} is off the table today. Recovery is the better play here, and backing off now gives the rest of the week a better chance to land well."
        return {
            "summary": summary,
            "whyBullets": [
                "Current signals say to back off.",
                "Less stress today sets up a better next session.",
            ],
            "decisionDrivers": decision_drivers,
            "cautionNote": caution_note,
            "encouragement": "Take the reset and come back fresher.",
            "source": "template_fallback",
        }
    summary = "We’re keeping the day on track, but with less stress than originally planned. You still get useful work in, just in a form that fits today better."
    if planned_label and final_label and planned_label.lower() != final_label.lower():
        summary = f"We’re moving away from {planned_label.lower()} and making this {final_label.lower()} instead. You still get useful work in, just in a form that fits today better."
    elif planned_label:
        summary = f"We’re keeping {planned_label.lower()} in place, but with less stress than originally planned. You still get useful work in, just in a form that fits today better."
    return {
        "summary": summary,
        "whyBullets": [
            "The structure stays in place.",
            "The load comes down to match today.",
        ],
        "decisionDrivers": decision_drivers,
        "cautionNote": caution_note,
        "encouragement": "Keep it controlled and let that be enough for today.",
        "source": "template_fallback",
    }


def _validate_explanation_output(output: dict, inputs: dict) -> bool:
    payload = _recommendation_explanation_payload(inputs)
    rec = payload["recommendation"]
    summary = str(output.get("summary") or "").strip()
    if not summary or _word_count(summary) > 120:
        return False

    why_bullets = output.get("whyBullets")
    if not isinstance(why_bullets, list) or len(why_bullets) > 3:
        return False
    cleaned_bullets = []
    for bullet in why_bullets:
        text = str(bullet or "").strip()
        if not text or _word_count(text) > 18:
            return False
        cleaned_bullets.append(text)

    caution_note = output.get("cautionNote")
    if caution_note is not None and not isinstance(caution_note, str):
        return False
    decision_drivers = output.get("decisionDrivers")
    if decision_drivers is not None and not isinstance(decision_drivers, str):
        return False
    if isinstance(decision_drivers, str) and (not decision_drivers.strip() or _word_count(decision_drivers) > 45):
        return False
    encouragement = output.get("encouragement")
    if encouragement is not None and not isinstance(encouragement, str):
        return False

    lowered_summary = summary.lower()
    plan_status = str(rec["planStatus"] or "")
    if plan_status == "preserved" and any(token in lowered_summary for token in ["adjusted", "replaced", "shifted", "eased", "lighter version"]):
        return False
    if plan_status == "modified" and not any(token in lowered_summary for token in ["adjust", "easier", "lighter", "reduced", "pull back", "shift"]):
        return False
    if plan_status == "replaced" and not any(token in lowered_summary for token in ["replaced", "recovery", "back off", "pull-back", "pull back"]):
        return False

    if not rec["run"]["shouldRun"] and any(token in lowered_summary for token in ["run today", "keep the run", "go run"]):
        return False
    lowered_encouragement = str(encouragement or "").lower()
    if not rec["lift"]["shouldLift"] and any(token in lowered_encouragement for token in ["lift", "strength"]):
        return False

    flags = dict(rec["flags"] or {})
    if flags.get("injuryOverride") or flags.get("forceRestOrCrossTrain"):
        caution_text = str(caution_note or "").lower()
        if caution_text and not any(token in caution_text for token in ["reassess", "recovery", "back off"]):
            return False

    output["whyBullets"] = cleaned_bullets
    output["summary"] = summary
    output["cautionNote"] = str(caution_note).strip() if isinstance(caution_note, str) and caution_note.strip() else None
    output["decisionDrivers"] = str(decision_drivers).strip() if isinstance(decision_drivers, str) and decision_drivers.strip() else None
    output["encouragement"] = str(encouragement).strip() if isinstance(encouragement, str) and encouragement.strip() else None
    return True


def _request_explanation_json(prompt: dict[str, str]) -> dict:
    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError("OpenAI SDK is not installed.") from exc

    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "").strip())
    response = client.responses.create(
        model=os.environ.get("OPENAI_EXPLANATION_MODEL", "gpt-5-mini"),
        temperature=0.2,
        input=[
            {"role": "system", "content": prompt["system"]},
            {"role": "user", "content": prompt["user"]},
        ],
    )
    parsed = _parse_response_json(response)
    if not isinstance(parsed, dict):
        raise ValueError("LLM explanation output was not a JSON object.")
    return parsed


def generate_recommendation_explanation(inputs: dict) -> dict:
    fallback = build_template_fallback_explanation(inputs)
    if not openai_enabled():
        return fallback

    prompt = build_explanation_prompt(inputs)
    try:
        output = _request_explanation_json(prompt)
    except Exception:
        return fallback

    if not _validate_explanation_output(output, inputs):
        return fallback

    return {
        "summary": output["summary"],
        "whyBullets": list(output.get("whyBullets") or []),
        "decisionDrivers": output.get("decisionDrivers"),
        "cautionNote": output.get("cautionNote"),
        "encouragement": output.get("encouragement"),
        "source": "llm",
    }


def buildExplanationPrompt(inputs: dict) -> dict[str, str]:
    return build_explanation_prompt(inputs)


def generateRecommendationExplanation(inputs: dict) -> dict:
    return generate_recommendation_explanation(inputs)


def buildTemplateFallbackExplanation(inputs: dict) -> dict:
    return build_template_fallback_explanation(inputs)


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
    adaptive_target = adaptive_weekly_reference(profile, runs)
    feedback = subjective_feedback or {}
    physical = str(feedback.get("physical_feeling") or "").strip().lower()
    mental = str(feedback.get("mental_feeling") or "").strip().lower()
    notes = str(feedback.get("notes") or "").strip().lower()
    recent_workout_notes = str(feedback.get("recent_workout_notes") or "").strip()
    recent_checkin_context = str(feedback.get("recent_checkin_context") or "").strip()
    weekly_strength_sessions_completed = int(feedback.get("weekly_strength_sessions_completed") or 0)
    strength_sessions_last_2_days = int(feedback.get("strength_sessions_last_2_days") or 0)
    has_strength_activity_today = bool(feedback.get("has_strength_activity_today"))
    today_completed_strain = float(feedback.get("today_completed_strain") or 0.0)
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
        "adaptive_weekly_target": adaptive_target,
        "recent_longest_run_21_day": longest_recent_run,
        "hard_runs_last_3_days": hard_runs_last_3,
        "high_strain_days_last_3_days": high_strain_days_last_3,
        "easy_pace_reference": pace_window(easy_pace, slower=0.7),
        "subjective_physical": physical,
        "subjective_mental": mental,
        "subjective_notes": notes,
        "recent_checkin_context": recent_checkin_context,
        "recent_workout_notes": recent_workout_notes,
        "weekly_strength_sessions_completed": weekly_strength_sessions_completed,
        "strength_sessions_last_2_days": strength_sessions_last_2_days,
        "has_strength_activity_today": has_strength_activity_today,
        "today_completed_strain": today_completed_strain,
        "illness_noted_in_checkin": illness_noted,
        "guardrails": [
            "If physical feedback says sick or the notes mention headache, fever, nausea, dizziness, flu-like symptoms, or feeling unwell, prescribe a rest day or very light walking only and no strength training.",
            "If recovery is below 35%, or sleep is below 5.5 hours, or resting heart rate is 7+ bpm above baseline, do not prescribe a hard workout.",
            "If recovery is below 50%, or sleep is below 6.0 hours, or resting heart rate is 4+ bpm above baseline, or heavy legs, soreness, stress, or mental fatigue are reported, downshift intensity. Sleep between 6.0 and 6.5 hours should only downshift when paired with mediocre recovery or other red flags.",
            "Do not prescribe a hard or tempo session if there was already a hard run in the last 3 days or multiple high-strain days in the last 3 days.",
            "Respect progression: avoid recommending a run more than about 10% longer than the athlete's recent longest run unless the race is close and the data strongly supports it.",
            "Prefer two rest or very low-strain days per week and cap lifting at three days per week unless there is an unusually strong reason not to.",
            "If weekly strength is behind target and readiness is good, prefer placing a short lift on an easy or non-run day instead of bunching lifts on back-to-back days later in the week.",
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
    weekly_reference = max(float(context.get("adaptive_weekly_target") or 0.0), 20.0)
    warnings = list(recommendation.warnings)
    explanation = list(recommendation.explanation)
    sections = dict(recommendation.explanation_sections)

    physical = context["subjective_physical"]
    mental = context["subjective_mental"]
    low_recovery = context["latest_recovery_score"] < 45
    poor_sleep = context["latest_sleep_hours"] < 6.0
    elevated_rhr = context["elevated_resting_hr"]
    soreness = physical in {"heavy", "sore", "injured"}
    mental_drag = mental in {"stressed", "drained"}
    illness = physical == "sick" or context["illness_noted_in_checkin"]

    low_readiness = low_recovery or poor_sleep or elevated_rhr or soreness or mental_drag
    severe_block = illness or (low_recovery and poor_sleep) or (soreness and mental_drag and elevated_rhr)
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
        recommendation.run_distance_miles = round(min(recommendation.run_distance_miles, max(3.0, weekly_reference * 0.16)), 1)
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
        or recommendation.run_distance_miles >= weekly_reference * 0.22
        or _intensity_rank(recommendation.intensity) >= 2
    )
    if lift_off_day:
        recommendation.lift_focus = "Today is a lifting off-day"
        recommendation.lift_guidance = "Today is a lifting off-day."
        sections["lift"] = "Today is a lifting off-day so the run can stand on its own without adding extra fatigue."
    else:
        strength_room = context["weekly_strength_sessions_completed"] < max(1, profile.desired_strength_frequency)
        no_recent_strength_stack = context["strength_sessions_last_2_days"] == 0 and not context["has_strength_activity_today"]
        easy_day = _intensity_rank(recommendation.intensity) <= 1 and recommendation.run_distance_miles <= max(3.5, weekly_reference * 0.16)

        if strength_room and no_recent_strength_stack and easy_day:
            if recommendation.run_distance_miles > 0:
                recommendation.lift_focus = "Light durability work only"
                recommendation.lift_guidance = (
                    "Use today's good readiness for a short lift after the run: 2-4 controlled exercises, stop 1-2 reps shy of failure, and keep it secondary to tomorrow's run quality."
                )
                sections["lift"] = (
                    "Strength is under target for the week, so this easy run can pair with a short durability lift without stacking too much fatigue."
                )
            else:
                recommendation.lift_focus = "Adaptive strength + core"
                recommendation.lift_guidance = (
                    "Readiness is strong and you are behind the weekly strength target, so make this a lift-focused day with 3-5 controlled movements and no grinding reps."
                )
                sections["lift"] = (
                    "With no meaningful run load today and strength still under target for the week, a lift is more useful than taking a full training off-day."
                )

    longest_recent_run = context["recent_longest_run_21_day"]
    target_cap = weekly_reference * 0.35
    recent_cap = longest_recent_run * 1.10 if longest_recent_run else max(4.0, weekly_reference * 0.18)
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


def _finalize_daily_adaptation(
    recommendation: Recommendation,
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    planned: dict[str, str | float],
    weekly_intent,
    subjective_feedback: dict | None = None,
) -> Recommendation:
    context = _safety_and_progression_context(profile, runs, metrics, recommendation.date, subjective_feedback)
    physical = context["subjective_physical"]
    mental = context["subjective_mental"]
    severe_block = (
        physical == "sick"
        or context["illness_noted_in_checkin"]
        or context["latest_recovery_score"] < 35
        or context["latest_sleep_hours"] < 5.5
        or context["severely_elevated_resting_hr"]
    )
    planned_workout = str(planned["workout"])
    planned_distance = float(planned["distance_miles"])
    planned_rest_slot = planned_distance <= 0 or "rest" in planned_workout.lower() or "mobility" in planned_workout.lower()
    actual_rest_slot = recommendation.run_distance_miles <= 0 and "rest" in str(recommendation.workout or "").lower()

    if planned_rest_slot and actual_rest_slot and not severe_block:
        recommendation.workout = planned_workout
        recommendation.intensity = "rest"
        recommendation.run_distance_miles = 0.0
        recommendation.duration_minutes = 0
        recommendation.run_pace_guidance = "Rest day"
        recommendation.lift_focus = "No lifting"
        recommendation.lift_guidance = "No lift today. Keep the day light so you stay fresher for the next key session."
        recommendation.explanation = [
            item for item in recommendation.explanation if not str(item).startswith("Guardrail:")
        ]
        recommendation.warnings = [
            item for item in recommendation.warnings if "Guardrail triggered" not in str(item)
        ]
        recommendation.explanation_sections = {
            **recommendation.explanation_sections,
            "overall": "Today stays light because the weekly structure is protecting recovery and the next important run, not because your readiness is unusually poor.",
            "run": "This is a planned low-stress slot in the week, so the best call is rest or optional light mobility rather than forcing extra mileage.",
            "pace": "No pace target today because the plan intentionally keeps the day easy and low-cost.",
            "lift": recommendation.lift_guidance,
            "recovery": (
                f"Recovery is {context['latest_recovery_score']}% with {context['latest_sleep_hours']:.1f} hours of sleep, "
                "which is compatible with training, but the weekly plan still benefits from a lighter day here."
            ),
        }
        readiness_status = "supported"
        adjustment_reason = "This is a planned low-stress day that helps preserve the week's structure and protect the next key session."
    else:
        readiness_status = "supported"
        if severe_block or recommendation.workout == "Rest and recovery":
            readiness_status = "not supported"
        elif recommendation.workout != recommendation.planned_workout:
            readiness_status = "partly supported"

        if readiness_status == "supported":
            adjustment_reason = recommendation.explanation_sections.get("overall") or "Recovery and subjective signals support the planned work."
        elif readiness_status == "partly supported":
            adjustment_reason = recommendation.explanation_sections.get("overall") or "The original plan was scaled down to match today's readiness."
        else:
            adjustment_reason = recommendation.explanation_sections.get("overall") or "Training stress is not well supported today."

    recommendation.daily_adaptation = {
        "planned_session": recommendation.planned_workout or planned_workout,
        "readiness_status": readiness_status,
        "adjustment_reason": adjustment_reason,
        "adjusted_session": recommendation.workout,
        "weekly_goal_remains": _weekly_goal_phrase(weekly_intent),
        "reschedule_suggestion": _reschedule_guidance(weekly_intent, readiness_status),
    }
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
    # Compatibility wrapper: the active daily recommendation path is now deterministic.
    # Keep this function so the existing app/API call sites do not need to change all at once.
    target_day = today or (parse_date(max(metrics, key=lambda item: item.day).day) if metrics else date.today())
    weekly_intent = weekly_intent or build_weekly_intent(profile, runs, metrics, today=target_day)
    recommendation = deterministic_recommendation(
        profile,
        runs,
        metrics,
        today=target_day,
        subjective_feedback=subjective_feedback,
        weekly_intent=weekly_intent,
        mode="conservative",
    )
    planned_workout = _build_planned_workout_payload(weekly_intent, profile, target_day)
    explanation = generate_recommendation_explanation(
        {
            "recommendation": recommendation,
            "plannedWorkout": planned_workout,
            "athleteName": profile.name,
        }
    )
    return recommendation, {
        "source": "deterministic",
        "model": None,
        "reason": None,
        "recommendation_explanation": explanation,
        "explanation_source": explanation["source"],
    }
