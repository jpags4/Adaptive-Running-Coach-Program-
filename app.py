from __future__ import annotations

import json
import mimetypes
import os
import re
from html import escape
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from datetime import datetime, timedelta
from urllib.parse import parse_qs, urlparse

from coach import (
    Recommendation,
    WeeklyIntent,
    assess_recommendation_uncertainty,
    average_easy_pace,
    build_weekly_intent,
    coach_recommendation,
    days_until_race,
    pace_window,
    recent_mileage,
)
from integrations import (
    OAuthError,
    build_strava_authorize_url,
    build_whoop_authorize_url,
    exchange_strava_code,
    exchange_whoop_code,
    fetch_strava_snapshot,
    strava_activity_preview,
    fetch_whoop_snapshot,
    generate_state,
    merge_live_data,
    profile_from_settings,
    safe_iso_today,
    snapshot_preview,
    strava_runs_to_model,
    strava_redirect_uri,
    valid_access_token,
    whoop_metrics_to_model,
    whoop_workout_preview,
    whoop_redirect_uri,
)
from sample_data import SAMPLE_METRICS, SAMPLE_PROFILE, SAMPLE_RUNS
from llm_coach import llm_recommendation
from storage import (
    load_daily_checkins,
    init_storage,
    load_activity_notes,
    load_settings,
    load_states,
    load_tokens,
    load_weekly_plans,
    save_activity_note,
    save_daily_checkin,
    save_settings,
    save_states,
    save_tokens,
    save_weekly_plans,
    using_hosted_env,
)


ROOT = Path(__file__).parent
STATIC_DIR = ROOT / "static"
FRONTEND_DIST_DIR = ROOT / "frontend" / "dist"
WEEKDAY_NAMES = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
]

HEALTH_NOTE_TOKENS = (
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
    "unwell",
)
SEVERE_HEALTH_NOTE_TOKENS = (
    "chest pain",
    "shortness of breath",
    "couldn't breathe",
    "fainted",
    "passed out",
    "blackout",
    "severe pain",
)


def _string_value(value, default: str = "") -> str:
    return str(value if value is not None else default).strip()


def _profile_settings_payload(settings: dict, tokens: dict) -> dict:
    hosted_env = using_hosted_env()
    public_base_url = settings.get("public_base_url", "")
    return {
        "athlete_name": _string_value(settings.get("athlete_name")),
        "goal_race_date": _string_value(settings.get("goal_race_date")),
        "preferred_long_run_day": _string_value(settings.get("preferred_long_run_day"), "Sunday") or "Sunday",
        "goal_half_marathon_time": _string_value(settings.get("goal_half_marathon_time")),
        "recent_race_result": _string_value(settings.get("recent_race_result")),
        "max_comfortable_long_run_miles": _string_value(settings.get("max_comfortable_long_run_miles")),
        "desired_runs_per_week": _string_value(settings.get("desired_runs_per_week"), "5") or "5",
        "desired_strength_frequency": _string_value(settings.get("desired_strength_frequency"), "2") or "2",
        "preferred_adaptation_emphasis": _string_value(settings.get("preferred_adaptation_emphasis")),
        "injury_flags": _string_value(settings.get("injury_flags")),
        "public_base_url": _string_value(public_base_url),
        "allow_insecure_ssl": bool(settings.get("allow_insecure_ssl")),
        "strava_client_id": _string_value(settings.get("strava", {}).get("client_id")),
        "strava_client_secret": _string_value(settings.get("strava", {}).get("client_secret")),
        "whoop_client_id": _string_value(settings.get("whoop", {}).get("client_id")),
        "whoop_client_secret": _string_value(settings.get("whoop", {}).get("client_secret")),
        "strava": {
            "client_id": _string_value(settings.get("strava", {}).get("client_id")),
            "client_secret": _string_value(settings.get("strava", {}).get("client_secret")),
            "connected": bool(settings.get("strava", {}).get("client_id")) and bool(tokens.get("strava")),
            "callback_url": strava_redirect_uri(public_base_url) if public_base_url else "",
            "connect_url": "/connect/strava",
        },
        "whoop": {
            "client_id": _string_value(settings.get("whoop", {}).get("client_id")),
            "client_secret": _string_value(settings.get("whoop", {}).get("client_secret")),
            "connected": bool(settings.get("whoop", {}).get("client_id")) and bool(tokens.get("whoop")),
            "callback_url": whoop_redirect_uri(public_base_url) if public_base_url else "",
            "connect_url": "/connect/whoop",
        },
        "hosted_env": hosted_env,
        "env_override_notice": "Hosted environment variables are present. You can still edit saved app settings here, but environment-backed values may override local saves after refresh." if hosted_env else "",
    }


def _settings_from_json_payload(existing_settings: dict, payload: dict) -> dict:
    settings = dict(existing_settings)
    settings["athlete_name"] = _string_value(payload.get("athlete_name"), settings.get("athlete_name", ""))
    settings["goal_race_date"] = _string_value(payload.get("goal_race_date"), settings.get("goal_race_date", ""))
    settings["preferred_long_run_day"] = _string_value(payload.get("preferred_long_run_day"), settings.get("preferred_long_run_day", "Sunday")) or "Sunday"
    settings["goal_half_marathon_time"] = _string_value(payload.get("goal_half_marathon_time"), settings.get("goal_half_marathon_time", ""))
    settings["recent_race_result"] = _string_value(payload.get("recent_race_result"), settings.get("recent_race_result", ""))
    settings["max_comfortable_long_run_miles"] = _string_value(payload.get("max_comfortable_long_run_miles"), settings.get("max_comfortable_long_run_miles", ""))
    settings["desired_runs_per_week"] = _string_value(payload.get("desired_runs_per_week"), settings.get("desired_runs_per_week", "5")) or "5"
    settings["desired_strength_frequency"] = _string_value(payload.get("desired_strength_frequency"), settings.get("desired_strength_frequency", "2")) or "2"
    settings["preferred_adaptation_emphasis"] = _string_value(payload.get("preferred_adaptation_emphasis"), settings.get("preferred_adaptation_emphasis", ""))
    settings["injury_flags"] = _string_value(payload.get("injury_flags"), settings.get("injury_flags", ""))
    settings["public_base_url"] = _string_value(payload.get("public_base_url"), settings.get("public_base_url", ""))
    settings["allow_insecure_ssl"] = bool(payload.get("allow_insecure_ssl", settings.get("allow_insecure_ssl", False)))
    settings.setdefault("strava", {})
    settings.setdefault("whoop", {})
    settings["strava"]["client_id"] = _string_value(payload.get("strava_client_id"), settings["strava"].get("client_id", ""))
    settings["strava"]["client_secret"] = _string_value(payload.get("strava_client_secret"), settings["strava"].get("client_secret", ""))
    settings["whoop"]["client_id"] = _string_value(payload.get("whoop_client_id"), settings["whoop"].get("client_id", ""))
    settings["whoop"]["client_secret"] = _string_value(payload.get("whoop_client_secret"), settings["whoop"].get("client_secret", ""))
    return settings


def _apply_clarification_answers_to_settings(settings: dict, subjective_feedback: dict | None) -> dict:
    if not subjective_feedback:
        return settings

    clarification_answers = subjective_feedback.get("clarification_answers") or {}
    if not isinstance(clarification_answers, dict):
        return settings

    updated = dict(settings)
    field_map = {
        "goal_time": "goal_half_marathon_time",
        "benchmark": "recent_race_result",
        "long_run_cap": "max_comfortable_long_run_miles",
    }
    for key, field in field_map.items():
        value = _string_value(clarification_answers.get(key))
        if value:
            updated[field] = value
    return updated


def previous_run_summary(runs: list) -> dict:
    if not runs:
        return {"day": "", "distance_miles": 0, "duration_minutes": 0, "workout_type": ""}

    latest_run = max(runs, key=lambda item: item.day)
    return {
        "day": latest_run.day,
        "distance_miles": latest_run.distance_miles,
        "duration_minutes": latest_run.duration_minutes,
        "workout_type": latest_run.workout_type.replace("_", " "),
    }


def sample_activity_preview(runs: list) -> list[dict]:
    ordered = sorted(runs, key=lambda item: item.day, reverse=True)
    return [
        {
            "source": "Strava",
            "name": run.workout_type.replace("_", " "),
            "day": run.day,
            "sport": "Run",
            "distance_miles": run.distance_miles,
            "duration_minutes": run.duration_minutes,
            "average_pace_min_per_mile": run.average_pace_min_per_mile,
        }
        for run in ordered
    ]


def _activity_source_text(activity: dict) -> str:
    return " ".join(
        str(activity.get(key) or "")
        for key in ("name", "sport", "sport_name", "type", "title", "modality", "source_title")
    ).strip()


def normalize_workout_category(activity: dict) -> str:
    raw = _activity_source_text(activity).lower()
    normalized = "".join(char for char in raw if char.isalpha() or char.isspace())
    if any(token in normalized for token in ("run", "running", "treadmill", "track", "jog")):
        return "running"
    if any(
        token in normalized
        for token in (
            "weight",
            "strength",
            "lift",
            "gym",
            "resistance",
            "functional strength",
            "functionalstrength",
            "weights",
        )
    ):
        return "weightlifting"
    if any(token in normalized for token in ("spin", "cycling", "bike", "indoor cycling", "stationary bike", "peloton", "ride")):
        return "spin"
    return "activity"


def _calendar_activity_kind(activity: dict) -> str:
    raw = _activity_source_text(activity).lower()
    normalized = "".join(char for char in raw if char.isalpha())
    if any(token in normalized for token in ("weight", "strength", "lift", "mobility", "stretch", "yoga", "pilates", "core")):
        return "strength"
    if "run" in normalized:
        return "run"
    if any(token in normalized for token in ("spin", "cycling", "bike", "peloton", "ride")):
        return "spin"
    return normalized or "activity"


def _filter_calendar_activities(activity_feed: list[dict]) -> list[dict]:
    filtered: list[dict] = []
    seen: set[tuple[str, str, int, str]] = set()

    for activity in activity_feed:
        kind = _calendar_activity_kind(activity)
        if kind not in {"run", "strength"}:
            continue

        duration = int(activity.get("duration_minutes") or 0)
        distance = str(activity.get("distance_miles") or 0)
        key = (str(activity.get("day") or ""), kind, duration, distance)
        if key in seen:
            continue

        seen.add(key)
        filtered.append(activity)

    return filtered


def _activity_key(activity: dict) -> str:
    return "|".join(
        [
            str(activity.get("source") or "unknown").strip().lower(),
            str(activity.get("day") or "").strip(),
            str(activity.get("sport") or activity.get("name") or "").strip().lower().replace(" ", "_"),
            str(int(activity.get("duration_minutes") or 0)),
            f"{float(activity.get('distance_miles') or 0.0):.2f}",
        ]
    )


def _attach_activity_notes(activities: list[dict], notes_by_key: dict[str, dict]) -> list[dict]:
    annotated: list[dict] = []
    for activity in activities:
        item = dict(activity)
        activity_key = _activity_key(item)
        note_payload = notes_by_key.get(activity_key, {}) if isinstance(notes_by_key, dict) else {}
        item["activity_key"] = activity_key
        item["note"] = str(note_payload.get("note") or "").strip()
        annotated.append(item)
    return annotated


def _parse_activity_timestamp(value: str | None) -> datetime | None:
    text = str(value or "").strip()
    if not text:
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00"))
    except Exception:
        return None


def _activity_text_signature(activity: dict) -> str:
    text = " ".join(
        str(activity.get(key) or "")
        for key in ("title", "source_title", "raw_type", "sport", "name")
    ).lower()
    return "".join(char for char in text if char.isalnum() or char.isspace()).strip()


def _activity_texts_compatible(left: dict, right: dict) -> bool:
    left_text = _activity_text_signature(left)
    right_text = _activity_text_signature(right)
    if not left_text or not right_text:
        return True
    return left_text == right_text or left_text in right_text or right_text in left_text


def _activity_times_close_or_overlap(left: dict, right: dict) -> bool:
    left_start = _parse_activity_timestamp(left.get("start_time"))
    right_start = _parse_activity_timestamp(right.get("start_time"))
    if left_start is None or right_start is None:
        return False
    left_end = _parse_activity_timestamp(left.get("end_time")) or (left_start + timedelta(minutes=int(left.get("duration_minutes") or 0)))
    right_end = _parse_activity_timestamp(right.get("end_time")) or (right_start + timedelta(minutes=int(right.get("duration_minutes") or 0)))
    latest_start = max(left_start, right_start)
    earliest_end = min(left_end, right_end)
    if latest_start <= earliest_end:
        return True
    return abs((left_start - right_start).total_seconds()) <= 15 * 60


def _activity_duplicate_match(left: dict, right: dict) -> bool:
    if str(left.get("category") or "") != str(right.get("category") or ""):
        return False
    if str(left.get("day") or "") != str(right.get("day") or ""):
        return False

    left_duration = int(left.get("duration_minutes") or 0)
    right_duration = int(right.get("duration_minutes") or 0)
    if abs(left_duration - right_duration) > 2:
        return False

    if _activity_times_close_or_overlap(left, right):
        return True

    return _activity_texts_compatible(left, right)


def _activity_richness_score(activity: dict) -> int:
    score = 0
    for key in ("strain", "distance_miles", "average_pace_min_per_mile", "source_title", "raw_type", "note", "start_time", "end_time", "source_id"):
        value = activity.get(key)
        if value not in (None, "", 0, 0.0):
            score += 1
    if str(activity.get("source") or "").upper() == "WHOOP" and activity.get("strain") not in (None, ""):
        score += 1
    return score


def _merge_activity_records(primary: dict, secondary: dict) -> dict:
    merged = dict(primary)
    for key, value in secondary.items():
        if merged.get(key) in (None, "", 0, 0.0) and value not in (None, "", 0, 0.0):
            merged[key] = value

    for key in ("strain", "distance_miles", "average_pace_min_per_mile", "duration_minutes", "duration_min", "pace", "raw_type", "source_title", "start_time", "end_time", "source_id", "calories"):
        primary_value = primary.get(key)
        secondary_value = secondary.get(key)
        if primary_value in (None, "", 0, 0.0) and secondary_value not in (None, "", 0, 0.0):
            merged[key] = secondary_value

    primary_note = str(primary.get("note") or "").strip()
    secondary_note = str(secondary.get("note") or "").strip()
    if not primary_note and secondary_note:
        merged["note"] = secondary_note
    elif primary_note and secondary_note and secondary_note not in primary_note:
        merged["note"] = primary_note if len(primary_note) >= len(secondary_note) else secondary_note

    return merged


def dedupe_workout_log_items(items: list[dict]) -> list[dict]:
    deduped: list[dict] = []
    for item in items:
        matched_index = next((index for index, existing in enumerate(deduped) if _activity_duplicate_match(existing, item)), None)
        if matched_index is None:
            deduped.append(dict(item))
            continue

        existing = deduped[matched_index]
        if _activity_richness_score(item) > _activity_richness_score(existing):
            deduped[matched_index] = _merge_activity_records(item, existing)
        else:
            deduped[matched_index] = _merge_activity_records(existing, item)
    return deduped


def _activity_log_payload(activities: list[dict]) -> dict[str, list[dict]]:
    def normalize_item(activity: dict) -> dict:
        item = dict(activity)
        category = normalize_workout_category(item)
        title = {
            "running": "Run",
            "weightlifting": "Weight Training",
            "spin": "Spin",
            "activity": "Activity",
        }.get(category, "Activity")
        raw_type = str(item.get("sport") or item.get("sport_name") or item.get("type") or "").strip() or None
        source_title = str(item.get("name") or item.get("title") or "").strip() or None
        item["category"] = category
        item["title"] = title
        item["raw_type"] = raw_type
        item["source_title"] = source_title
        item["date"] = str(item.get("day") or "")
        item["duration_min"] = item.get("duration_minutes")
        item["distance"] = item.get("distance_miles")
        item["pace"] = item.get("pace_text") or item.get("run_pace_guidance")
        return item

    normalized = dedupe_workout_log_items([normalize_item(item) for item in activities])
    runs = [item for item in normalized if item.get("category") == "running"]
    strength = [item for item in normalized if item.get("category") == "weightlifting"]
    spin = [item for item in normalized if item.get("category") == "spin"]
    generic = [item for item in normalized if item.get("category") == "activity"]
    ordered_runs = sorted(runs, key=lambda item: (str(item.get("day") or ""), float(item.get("distance_miles") or 0.0)), reverse=True)
    ordered_strength = sorted(strength, key=lambda item: (str(item.get("day") or ""), int(item.get("duration_minutes") or 0)), reverse=True)
    ordered_spin = sorted(spin, key=lambda item: (str(item.get("day") or ""), int(item.get("duration_minutes") or 0)), reverse=True)
    ordered_generic = sorted(generic, key=lambda item: (str(item.get("day") or ""), int(item.get("duration_minutes") or 0)), reverse=True)
    return {
        "runs": ordered_runs,
        "strength": ordered_strength,
        "spin": ordered_spin,
        "activity": ordered_generic,
    }


def _activity_notes_context(
    activity_log: dict[str, list[dict]],
    limit: int = 4,
    reference_day: str | None = None,
    current_feedback: dict | None = None,
) -> str:
    noted_items = [
        item
        for bucket in ("runs", "strength", "spin", "activity")
        for item in activity_log.get(bucket, [])
        if str(item.get("note") or "").strip()
    ]
    noted_items.sort(key=lambda item: str(item.get("day") or ""), reverse=True)
    if reference_day:
        try:
            reference_date = datetime.strptime(reference_day, "%Y-%m-%d").date()
        except ValueError:
            reference_date = None
    else:
        reference_date = None

    if reference_date is not None:
        recent_cutoff = reference_date - timedelta(days=3)
        noted_items = [
            item
            for item in noted_items
            if str(item.get("day") or "").strip()
            and datetime.strptime(str(item.get("day") or "").strip(), "%Y-%m-%d").date() >= recent_cutoff
        ]

    feedback = current_feedback or {}
    physical = str(feedback.get("physical_feeling") or "").strip().lower()
    mental = str(feedback.get("mental_feeling") or "").strip().lower()
    today_notes = str(feedback.get("notes") or "").strip().lower()
    healthy_checkin = physical in {"fresh", "normal"} and mental in {"sharp", "steady"} and not today_notes

    if healthy_checkin and reference_date is not None:
        filtered_items: list[dict] = []
        for item in noted_items:
            note = str(item.get("note") or "").strip().lower()
            if not note:
                continue
            item_day = datetime.strptime(str(item.get("day") or "").strip(), "%Y-%m-%d").date()
            days_old = (reference_date - item_day).days
            has_health_note = any(token in note for token in HEALTH_NOTE_TOKENS)
            severe_health_note = any(token in note for token in SEVERE_HEALTH_NOTE_TOKENS)
            if has_health_note and not severe_health_note:
                if days_old > 0:
                    continue
            elif severe_health_note and days_old > 1:
                continue
            filtered_items.append(item)
        noted_items = filtered_items

    context_lines: list[str] = []
    for item in noted_items[:limit]:
        label = str(item.get("title") or item.get("name") or item.get("sport") or "Workout").strip()
        day = str(item.get("day") or "").strip()
        details: list[str] = []
        if float(item.get("distance_miles") or 0.0) > 0:
            details.append(f"{float(item.get('distance_miles') or 0.0):.1f} mi")
        if int(item.get("duration_minutes") or 0) > 0:
            details.append(f"{int(item.get('duration_minutes') or 0)} min")
        note = str(item.get("note") or "").strip()
        context_lines.append(f"{day} {label} ({', '.join(details) if details else 'logged workout'}): {note}")
    return "\n".join(context_lines)


def _planned_skip_today(feedback: dict | None) -> bool:
    text = str((feedback or {}).get("notes") or "").strip().lower()
    if not text:
        return False
    phrases = (
        "not running today",
        "not going to run today",
        "won't run today",
        "will not run today",
        "skip today",
        "skipping today",
        "taking today off",
        "resting today",
        "rest day today",
    )
    return any(phrase in text for phrase in phrases)


def _recent_checkin_context(checkins: dict[str, dict], reference_day: str, limit: int = 3) -> str:
    if not reference_day or not isinstance(checkins, dict):
        return ""
    try:
        reference_date = datetime.strptime(reference_day, "%Y-%m-%d").date()
    except ValueError:
        return ""

    recent_entries: list[tuple[str, dict]] = []
    for day, payload in checkins.items():
        try:
            day_value = datetime.strptime(str(day), "%Y-%m-%d").date()
        except ValueError:
            continue
        days_old = (reference_date - day_value).days
        if days_old < 0 or days_old > 3:
            continue
        recent_entries.append((str(day), payload if isinstance(payload, dict) else {}))

    recent_entries.sort(key=lambda item: item[0], reverse=True)
    lines: list[str] = []
    for day, payload in recent_entries[:limit]:
        physical = str(payload.get("physical_feeling") or "").strip().lower()
        mental = str(payload.get("mental_feeling") or "").strip().lower()
        notes = str(payload.get("notes") or "").strip()
        planned_skip = bool(payload.get("planned_skip_today"))
        parts = []
        if physical:
            parts.append(f"legs: {physical}")
        if mental:
            parts.append(f"mind: {mental}")
        if planned_skip:
            parts.append("planned to skip that day")
        if notes:
            parts.append(f"notes: {notes}")
        if parts:
            lines.append(f"{day} check-in: " + "; ".join(parts))
    return "\n".join(lines)


def _apply_prior_week_completion_cap(weekly_intent: WeeklyIntent, runs: list, prior_week_cutoff) -> WeeklyIntent:
    prior_week_start = prior_week_cutoff - timedelta(days=prior_week_cutoff.weekday())
    prior_week_miles = round(
        sum(
            float(run.distance_miles or 0.0)
            for run in runs
            if prior_week_start <= datetime.strptime(run.day, "%Y-%m-%d").date() <= prior_week_cutoff
        ),
        1,
    )
    if prior_week_miles <= 0:
        return weekly_intent

    reachable_target = round(max(16.0, min(weekly_intent.mileage_target, max(prior_week_miles * 1.06, prior_week_miles + 1.0))), 1)
    if reachable_target >= weekly_intent.mileage_target - 0.2:
        return weekly_intent

    weekly_intent.mileage_target = reachable_target
    weekly_intent.mileage_range = f"{max(10.0, reachable_target - 1.5):.0f}-{reachable_target + 1.5:.0f} miles"
    weekly_intent.progression_note = (
        f"{weekly_intent.progression_note} Next week stays reachable after this week's actual completion came in below target."
    ).strip()
    return weekly_intent


def _merge_projected_future_activities(recorded: list[dict], projected: list[dict]) -> list[dict]:
    if not recorded:
        return projected
    if not projected:
        return recorded

    has_recorded_run = any(_calendar_activity_kind(item) == "run" for item in recorded)
    has_recorded_strength = any(_calendar_activity_kind(item) == "strength" for item in recorded)

    merged = list(recorded)
    for item in projected:
        kind = _calendar_activity_kind(item)
        if kind == "run" and not has_recorded_run:
            merged.append(item)
            has_recorded_run = True
        elif kind == "strength" and not has_recorded_strength:
            merged.append(item)
            has_recorded_strength = True

    return merged


def _recommendation_training_context(activity_feed: list[dict], today_iso: str) -> dict:
    if not today_iso:
        return {}

    today_value = datetime.strptime(today_iso, "%Y-%m-%d").date()
    week_start = today_value - timedelta(days=today_value.weekday())
    prior_two_day_cutoff = today_value - timedelta(days=2)

    strength_days_this_week: set[str] = set()
    strength_days_last_two: set[str] = set()
    today_has_strength = False
    today_strain_values: list[float] = []

    for item in activity_feed:
        day = str(item.get("day") or "")
        if not day:
            continue
        try:
            day_value = datetime.strptime(day, "%Y-%m-%d").date()
        except ValueError:
            continue

        kind = _calendar_activity_kind(item)
        if day == today_iso and item.get("strain") is not None:
            try:
                today_strain_values.append(float(item.get("strain") or 0.0))
            except (TypeError, ValueError):
                pass

        if kind != "strength":
            continue

        if week_start <= day_value <= today_value:
            strength_days_this_week.add(day)
        if prior_two_day_cutoff <= day_value < today_value:
            strength_days_last_two.add(day)
        if day == today_iso:
            today_has_strength = True

    return {
        "weekly_strength_sessions_completed": len(strength_days_this_week),
        "strength_sessions_last_2_days": len(strength_days_last_two),
        "has_strength_activity_today": today_has_strength,
        "today_completed_strain": round(max(today_strain_values or [0.0]), 1),
    }


def _preferred_long_run_index(value: str) -> int:
    normalized = str(value or "").strip().lower()
    return WEEKDAY_NAMES.index(normalized) if normalized in WEEKDAY_NAMES else 6


def _parse_pace_bounds(text: str) -> tuple[float, float] | None:
    value = str(text or "").strip()
    range_match = re.search(r"(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})\s*(?:min/mi|/mi)", value, re.IGNORECASE)
    if range_match:
        low = int(range_match.group(1)) + int(range_match.group(2)) / 60
        high = int(range_match.group(3)) + int(range_match.group(4)) / 60
        return low, high

    single_match = re.search(r"(\d{1,2}):(\d{2})\s*(?:min/mi|/mi)", value, re.IGNORECASE)
    if single_match:
        pace = int(single_match.group(1)) + int(single_match.group(2)) / 60
        return pace, pace

    decimal_range = re.search(r"(\d{1,2}\.\d{2})\s*[–-]\s*(\d{1,2}\.\d{2})\s*min/mi", value, re.IGNORECASE)
    if decimal_range:
        return float(decimal_range.group(1)), float(decimal_range.group(2))

    return None


def _format_pace_value(value: float) -> str:
    total_seconds = max(270, int(round(value * 60)))
    minutes = total_seconds // 60
    seconds = total_seconds % 60
    return f"{minutes}:{seconds:02d}"


def _shift_pace_bounds(bounds: tuple[float, float], faster: float = 0.0, slower: float = 0.0) -> str:
    low, high = bounds
    shifted_low = max(4.5, low - faster)
    shifted_high = max(shifted_low, high + slower - faster)
    return f"{_format_pace_value(shifted_low)}-{_format_pace_value(shifted_high)}/mi"


def _pace_text_for_type(workout_type: str, recommendation, weekly_intent: dict | None = None) -> str:
    pace_model = getattr(recommendation, "pace_model", {}) or {}
    primary_adaptation = str((weekly_intent or {}).get("primary_adaptation") or "").strip().lower()
    if pace_model:
        if workout_type == "quality":
            if primary_adaptation == "race-specific stamina":
                return str(
                    pace_model.get("race_pace", {}).get("pace_range")
                    or pace_model.get("threshold", {}).get("pace_range")
                    or recommendation.run_pace_guidance
                )
            return str(
                pace_model.get("threshold", {}).get("pace_range")
                or pace_model.get("race_pace", {}).get("pace_range")
                or recommendation.run_pace_guidance
            )
        if workout_type == "steady":
            return str(pace_model.get("steady", {}).get("pace_range") or recommendation.run_pace_guidance)
        if workout_type == "long":
            return str(pace_model.get("long_run", {}).get("pace_range") or recommendation.run_pace_guidance)
        return str(pace_model.get("easy", {}).get("pace_range") or recommendation.run_pace_guidance)

    base = str(recommendation.run_pace_guidance or "").strip()
    bounds = _parse_pace_bounds(base)
    if bounds:
        if workout_type == "quality":
            return _shift_pace_bounds(bounds, faster=0.85, slower=-0.3)
        if workout_type == "steady":
            return _shift_pace_bounds(bounds, faster=0.4, slower=-0.05)
        if workout_type == "long":
            return _shift_pace_bounds(bounds, faster=-0.05, slower=0.3)
        return _shift_pace_bounds(bounds, faster=0.0, slower=0.35)

    if workout_type == "quality":
        return "8:30-8:55/mi"
    if workout_type == "steady":
        return "8:55-9:20/mi"
    if workout_type == "long":
        return "9:25-9:55/mi"
    return base or "9:15-9:45/mi"


def _lift_focus_for_day(weekday: int, long_run_day: int) -> str:
    quality_day = (long_run_day - 5) % 7
    steady_day = (long_run_day - 3) % 7
    easy_day = (quality_day - 1) % 7

    if weekday == easy_day:
        return "Single-Leg Strength + Glutes"
    if weekday == steady_day:
        return "Upper Body + Core"
    if weekday == long_run_day:
        return "Posterior Chain + Core"
    return ""


def _run_blueprints(long_run_day: int, recommendation, weekly_intent: dict | None = None) -> dict[int, dict]:
    quality_day = (long_run_day - 5) % 7
    steady_day = (long_run_day - 3) % 7
    easy_day = (quality_day - 1) % 7
    aerobic_day = (steady_day + 1) % 7
    primary_adaptation = str((weekly_intent or {}).get("primary_adaptation") or "").strip().lower()
    absorb_week = primary_adaptation == "recovery / absorb"
    quality_intensity = "hard" if primary_adaptation in {"threshold", "race-specific stamina"} else "moderate"
    if absorb_week:
        quality_intensity = "easy"

    run_blueprints = {
        easy_day: {
            "weight": 0.18,
            "duration": 42,
            "intensity": "easy",
            "pace_text": _pace_text_for_type("easy", recommendation, weekly_intent=weekly_intent),
        },
        quality_day: {
            "weight": 0.20,
            "duration": 52 if quality_intensity == "hard" else 44,
            "intensity": quality_intensity,
            "pace_text": _pace_text_for_type("quality", recommendation, weekly_intent=weekly_intent),
        },
        steady_day: {
            "weight": 0.22,
            "duration": 48,
            "intensity": "moderate",
            "pace_text": _pace_text_for_type("steady", recommendation, weekly_intent=weekly_intent),
        },
        aerobic_day: {
            "weight": 0.16,
            "duration": 40,
            "intensity": "easy",
            "pace_text": _pace_text_for_type("easy", recommendation, weekly_intent=weekly_intent),
        },
        long_run_day: {
            "weight": 0.24,
            "duration": 70,
            "intensity": "moderate",
            "pace_text": _pace_text_for_type("long", recommendation, weekly_intent=weekly_intent),
        },
    }
    return run_blueprints


def _projected_day_template(projection_date, long_run_day: int, blueprint: dict | None, distance_miles: float) -> list[dict]:
    weekday = projection_date.weekday()
    if not blueprint:
        return []

    activities = [
        {
            "source": "Projection",
            "name": "Run",
            "day": projection_date.isoformat(),
            "sport": "Projected Run",
            "distance_miles": round(max(2.5, distance_miles), 1),
            "duration_minutes": max(20, int(blueprint["duration"])),
            "average_pace_min_per_mile": 0,
            "pace_text": blueprint["pace_text"],
            "intensity": blueprint["intensity"],
            "projected": True,
        }
    ]

    lift_focus = _lift_focus_for_day(weekday, long_run_day)
    if lift_focus:
        activities.append(
            {
                "source": "Projection",
                "name": "Lift",
                "day": projection_date.isoformat(),
                "sport": "Projected Strength",
                "distance_miles": 0,
                "duration_minutes": 30,
                "average_pace_min_per_mile": 0,
                "lift_focus": lift_focus,
                "intensity": "easy" if blueprint["intensity"] == "easy" else "moderate",
                "projected": True,
            }
        )

    return activities


def projected_calendar_entries(anchor, recommendation, end_day, profile) -> dict[str, list[dict]]:
    if not recommendation or recommendation.run_distance_miles <= 0:
        return {}

    projections: dict[str, list[dict]] = {}
    long_run_day = _preferred_long_run_index(getattr(profile, "preferred_long_run_day", "Sunday"))
    weekly_intent = getattr(recommendation, "weekly_intent", {}) or {}
    run_blueprints = _run_blueprints(long_run_day, recommendation, weekly_intent=weekly_intent)
    current_week_start = anchor - timedelta(days=anchor.weekday())
    if weekly_intent:
        base_weekly_target = max(20.0, float(weekly_intent.get("mileage_target") or 0))
    else:
        long_run_anchor = float(getattr(profile, "max_comfortable_long_run_miles", 0) or 0)
        desired_runs = max(3, int(getattr(profile, "desired_runs_per_week", 5) or 5))
        base_weekly_target = max(30.0, recommendation.run_distance_miles * 6.0, long_run_anchor * 3.0, desired_runs * 4.5)
    projection_date = anchor + timedelta(days=1)

    while projection_date <= end_day:
        week_start = projection_date - timedelta(days=projection_date.weekday())
        week_end = min(end_day, week_start + timedelta(days=6))
        week_offset = max(0, (week_start - current_week_start).days // 7)
        week_type = str(weekly_intent.get("week_type") or "").strip().lower()
        multiplier = 1.05 if week_type == "build" else 0.92 if week_type == "absorb" else 0.8 if week_type == "taper" else 1.1 if not weekly_intent else 1.0
        if week_offset == 0:
            target_week_miles = round(base_weekly_target, 1)
        else:
            target_week_miles = round(base_weekly_target * (multiplier ** week_offset), 1)

        week_days = [
            day
            for day in (week_start + timedelta(days=offset) for offset in range((week_end - week_start).days + 1))
            if day > anchor
        ]
        eligible_days = [day for day in week_days if day.weekday() in run_blueprints]
        total_weight = sum(run_blueprints[day.weekday()]["weight"] for day in eligible_days) or 1.0
        remaining_miles = max(0.0, target_week_miles - (recommendation.run_distance_miles if week_offset == 0 else 0.0))

        for day in week_days:
            blueprint = run_blueprints.get(day.weekday())
            distance_miles = 0.0
            if blueprint:
                distance_miles = remaining_miles * (blueprint["weight"] / total_weight)
            projections[day.isoformat()] = _projected_day_template(day, long_run_day, blueprint, distance_miles)

        projection_date = week_end + timedelta(days=1)
    return projections


def _today_plan_entries(anchor, recommendation) -> list[dict]:
    if not recommendation:
        return []

    activities: list[dict] = []
    if str(getattr(recommendation, "primary_modality", "run") or "run").lower() == "bike" and recommendation.duration_minutes > 0:
        activities.append(
            {
                "source": "Projection",
                "name": "Bike",
                "day": anchor.isoformat(),
                "sport": "Projected Bike",
                "distance_miles": 0,
                "duration_minutes": max(20, recommendation.duration_minutes),
                "average_pace_min_per_mile": 0,
                "pace_text": recommendation.run_pace_guidance,
                "intensity": recommendation.intensity,
                "projected": True,
            }
        )
    elif recommendation.run_distance_miles > 0:
        activities.append(
            {
                "source": "Projection",
                "name": "Run",
                "day": anchor.isoformat(),
                "sport": "Projected Run",
                "distance_miles": round(max(0.0, recommendation.run_distance_miles), 1),
                "duration_minutes": max(20, recommendation.duration_minutes),
                "average_pace_min_per_mile": 0,
                "pace_text": recommendation.run_pace_guidance,
                "intensity": recommendation.intensity,
                "projected": True,
            }
        )

    if str(recommendation.lift_focus or "").strip().lower() not in {"no lifting", "today is a lifting off-day"}:
        activities.append(
            {
                "source": "Projection",
                "name": "Lift",
                "day": anchor.isoformat(),
                "sport": "Projected Strength",
                "distance_miles": 0,
                "duration_minutes": 35,
                "average_pace_min_per_mile": 0,
                "lift_focus": recommendation.lift_focus,
                "intensity": "easy" if str(recommendation.intensity).lower() == "easy" else "moderate",
                "projected": True,
            }
        )

    return activities


def _week_plan_key(day_value) -> str:
    week_start = day_value - timedelta(days=day_value.weekday())
    return week_start.isoformat()


def _week_start(day_value):
    return day_value - timedelta(days=day_value.weekday())


def _runs_through_day(runs, cutoff_day):
    return [run for run in runs if datetime.strptime(run.day, "%Y-%m-%d").date() <= cutoff_day]


def _metrics_through_day(metrics, cutoff_day):
    return [metric for metric in metrics if datetime.strptime(metric.day, "%Y-%m-%d").date() <= cutoff_day]


def _generate_weekly_plan(anchor, profile, runs, metrics) -> dict:
    week_start = _week_start(anchor)
    prior_week_cutoff = week_start - timedelta(days=1)
    historical_runs = _runs_through_day(runs, prior_week_cutoff)
    historical_metrics = _metrics_through_day(metrics, prior_week_cutoff)
    planning_runs = historical_runs or _runs_through_day(runs, anchor) or runs
    planning_metrics = historical_metrics or _metrics_through_day(metrics, anchor) or metrics

    weekly_intent = build_weekly_intent(profile, planning_runs, planning_metrics, today=week_start)
    weekly_intent = _apply_prior_week_completion_cap(weekly_intent, planning_runs, prior_week_cutoff)
    baseline_recommendation = coach_recommendation(
        profile,
        planning_runs,
        planning_metrics,
        today=week_start,
        weekly_intent=weekly_intent,
    )
    if baseline_recommendation.run_distance_miles <= 0:
        easy_pace = average_easy_pace(planning_runs or runs)
        baseline_recommendation = Recommendation(
            date=week_start.isoformat(),
            workout="Baseline aerobic run",
            intensity="easy",
            duration_minutes=48,
            run_distance_miles=round(max(4.0, min(6.0, float(getattr(weekly_intent, "mileage_target", 24) or 24) * 0.18)), 1),
            run_pace_guidance=pace_window(easy_pace, slower=0.7),
            lift_focus="Single-Leg Strength + Core",
            lift_guidance="Baseline weekly structure only.",
            recap=[],
            explanation=["Baseline week structure generated so the calendar remains stable even if today becomes a recovery day."],
            explanation_sections={
                "overall": "Baseline week structure generated so the calendar remains stable even if today becomes a recovery day.",
                "run": "The baseline run distance seeds the weekly structure before daily adjustments are applied.",
                "pace": "The baseline pace uses your recent easy running so future days keep a practical pace band.",
                "lift": "Lift slots stay in the weekly structure, but daily guardrails can still remove them.",
                "recovery": "Daily recovery can still override today's training without erasing the rest of the week.",
            },
            warnings=[],
            confidence="medium",
            weekly_intent=weekly_intent.to_dict(),
        )
    end_day = week_start + timedelta(days=6)
    plan = projected_calendar_entries(week_start, baseline_recommendation, end_day, profile)
    monday_entries = _today_plan_entries(week_start, baseline_recommendation)
    if monday_entries:
        plan = {week_start.isoformat(): monday_entries, **plan}
    return {
        "week_start": week_start.isoformat(),
        "planned_from_day": prior_week_cutoff.isoformat(),
        "weekly_intent": weekly_intent.to_dict(),
        "activities": plan,
    }


def _load_or_create_weekly_plan(anchor, profile, runs, metrics) -> dict:
    plans = load_weekly_plans()
    key = _week_plan_key(anchor)
    plan = plans.get(key)
    if isinstance(plan, dict) and plan and isinstance(plan.get("activities"), dict) and isinstance(plan.get("weekly_intent"), dict):
        return plan

    plan = _generate_weekly_plan(anchor, profile, runs, metrics)
    plans[key] = plan
    save_weekly_plans(plans)
    return plan


def build_training_roadmap(anchor, profile, runs, metrics, weeks: int = 4) -> list[dict]:
    roadmap: list[dict] = []
    current_week_start = anchor - timedelta(days=anchor.weekday())
    current_intent = build_weekly_intent(profile, runs, metrics, today=anchor)
    projected_miles = round(float(current_intent.mileage_target), 1)

    for week_offset in range(1, weeks + 1):
        week_start = current_week_start + timedelta(days=7 * week_offset)
        week_end = week_start + timedelta(days=6)
        intent = build_weekly_intent(profile, runs, metrics, today=week_start)
        certainty = "moderate" if week_offset == 1 else "light" if week_offset == 2 else "tentative"
        if intent.week_type == "taper":
            projected_miles = round(max(12.0, projected_miles * 0.78), 1)
        elif intent.week_type == "absorb":
            projected_miles = round(max(16.0, projected_miles * 0.9), 1)
        elif intent.week_type == "build":
            projected_miles = round(max(projected_miles * 1.04, float(intent.mileage_target or projected_miles)), 1)
        else:
            projected_miles = round(max(projected_miles * 0.99, float(intent.mileage_target or projected_miles)), 1)
        hard_days = 1 if intent.primary_adaptation in {"threshold", "race-specific stamina"} else 0
        rest_days = 3 if intent.week_type in {"absorb", "taper"} else 2
        summary = (
            f"{intent.phase} week focused on {intent.primary_adaptation}."
            if intent.primary_adaptation
            else intent.phase
        )
        roadmap.append(
            {
                "week_start": week_start.isoformat(),
                "week_end": week_end.isoformat(),
                "label": f"Week of {week_start.strftime('%b')} {week_start.day}",
                "phase": intent.phase,
                "week_type": intent.week_type,
                "primary_adaptation": intent.primary_adaptation,
                "mileage_range": f"{max(10.0, projected_miles - 1.5):.0f}-{projected_miles + 1.5:.0f} miles",
                "estimated_total_miles": projected_miles,
                "estimated_hard_days": hard_days,
                "estimated_rest_days": rest_days,
                "long_run_target": intent.long_run_target,
                "quality_session_target": intent.quality_session_target,
                "progression_note": intent.progression_note,
                "race_connection": intent.race_connection,
                "summary": summary,
                "strength_target": intent.strength_target,
                "strain_constraints": list(intent.strain_constraints),
                "non_negotiables": list(intent.non_negotiables),
                "flex_points": list(intent.flex_points),
                "certainty": certainty,
                "confidence_note": (
                    "Most likely next step if recovery and training stay on track."
                    if certainty == "moderate"
                    else "Directional outlook that may shift with recovery, life stress, and how this week lands."
                    if certainty == "light"
                    else "Longer-range sketch only. Expect this to change as new data comes in."
                ),
                "days_to_race": days_until_race(profile.goal_race_date, week_start),
            }
        )

    return roadmap


def calendar_days(activity_feed: list[dict], metrics: list, recommendation=None, today: str = "", profile=None, weekly_plan=None) -> list[dict]:
    anchor = datetime.strptime(today, "%Y-%m-%d").date() if today else datetime.utcnow().date()
    feed_by_day: dict[str, list[dict]] = {}
    for item in activity_feed:
        day = item.get("day", "")
        if not day:
            continue
        feed_by_day.setdefault(day, []).append(item)

    start_day = anchor - timedelta(days=anchor.weekday())
    end_day = start_day + timedelta(days=6)
    projected_by_day = weekly_plan or {}

    cards: list[dict] = []
    current_day = start_day
    while current_day <= end_day:
        iso_day = current_day.isoformat()
        activities = feed_by_day.get(iso_day, [])
        projected = False
        if not activities and current_day == anchor:
            activities = _today_plan_entries(anchor, recommendation)
            projected = bool(activities)
        elif current_day > anchor:
            projected_activities = projected_by_day.get(iso_day, [])
            if activities:
                merged = _merge_projected_future_activities(activities, projected_activities)
                projected = len(merged) > len(activities)
                activities = merged
            else:
                activities = projected_activities
                projected = bool(activities)

        cards.append(
            {
                "day": iso_day,
                "activities": sorted(
                    activities,
                    key=lambda item: (item.get("projected", False), item.get("duration_minutes", 0)),
                    reverse=True,
                ),
                "is_today": iso_day == anchor.isoformat(),
                "is_current_month": current_day.month == anchor.month,
                "is_projection": projected,
            }
        )
        current_day += timedelta(days=1)

    return cards


def _current_day_status(today_iso: str, activity_feed: list[dict], recommendation) -> dict | None:
    if not today_iso:
        return None

    todays_activities = [item for item in activity_feed if str(item.get("day") or "") == today_iso]
    if not todays_activities:
        return None

    todays_runs = [
        item for item in todays_activities
        if _calendar_activity_kind(item) == "run"
    ]
    todays_strength = [
        item for item in todays_activities
        if _calendar_activity_kind(item) == "strength"
    ]

    completed_run_miles = round(sum(float(item.get("distance_miles") or 0.0) for item in todays_runs), 1)
    completed_strain = max(
        [float(item.get("strain") or 0.0) for item in todays_activities if item.get("strain") is not None] or [0.0]
    )
    planned_miles = round(float(getattr(recommendation, "run_distance_miles", 0.0) or 0.0), 1) if recommendation else 0.0
    planned_modality = str(getattr(recommendation, "primary_modality", "run") or "run").lower() if recommendation else "run"
    planned_duration = int(getattr(recommendation, "duration_minutes", 0) or 0) if recommendation else 0

    if planned_modality == "bike" and planned_duration > 0:
        status = "cross_trained"
        headline = "Today's bike session is still available."
        detail = f"The recommendation is a {planned_duration}-minute bike workout instead of a run."
    elif planned_miles <= 0:
        status = "completed"
        headline = "You already trained today."
        detail = f"Logged {completed_run_miles:.1f} run miles today." if completed_run_miles > 0 else "A workout is already logged for today."
    elif completed_run_miles >= planned_miles * 0.9:
        status = "on_track"
        headline = "Today is on track."
        detail = f"You've logged {completed_run_miles:.1f} of the planned {planned_miles:.1f} miles."
    elif completed_run_miles > 0:
        status = "in_progress"
        headline = "Today's work is in progress."
        detail = f"You've logged {completed_run_miles:.1f} of the planned {planned_miles:.1f} miles so far."
    else:
        status = "cross_trained"
        headline = "You already trained, but not with the planned run yet."
        detail = "Cross-training is logged for today, so use the recommendation as a remainder-of-day guide."

    if todays_strength and completed_run_miles <= 0:
        detail += " Strength work is already on the board."
    if completed_strain:
        detail += f" Current recorded strain: {completed_strain:.1f}."

    return {
        "status": status,
        "headline": headline,
        "detail": detail,
        "completed_run_miles": completed_run_miles,
        "planned_run_miles": planned_miles,
        "has_strength_activity": bool(todays_strength),
        "todays_activities": len(todays_activities),
    }


def build_dashboard_payload(settings, tokens, subjective_feedback: dict | None = None, include_recommendation: bool = False) -> dict:
    settings = _apply_clarification_answers_to_settings(settings, subjective_feedback)
    connection_status = {
        "strava": bool(settings.get("strava", {}).get("client_id")) and bool(tokens.get("strava")),
        "whoop": bool(settings.get("whoop", {}).get("client_id")) and bool(tokens.get("whoop")),
    }
    profile = profile_from_settings(settings)
    runs = SAMPLE_RUNS
    metrics = SAMPLE_METRICS
    live_preview = {"mode": "sample"}
    activity_feed = sample_activity_preview(runs)
    all_activities = list(activity_feed)
    logged_activities: list[dict] = []

    try:
        live_strava = None
        live_whoop = None
        warnings: list[str] = []

        if tokens.get("strava"):
            refreshed = valid_access_token("strava", settings, tokens)
            if refreshed:
                tokens["strava"] = refreshed
                save_tokens(tokens)
                live_strava = fetch_strava_snapshot(
                    refreshed["access_token"],
                    allow_insecure_ssl=bool(settings.get("allow_insecure_ssl")),
                    user_agent=settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
                )
            else:
                warnings.append("Strava token could not be refreshed.")

        if tokens.get("whoop"):
            refreshed = valid_access_token("whoop", settings, tokens)
            if refreshed:
                tokens["whoop"] = refreshed
                save_tokens(tokens)
                live_whoop = fetch_whoop_snapshot(
                    refreshed["access_token"],
                    allow_insecure_ssl=bool(settings.get("allow_insecure_ssl")),
                    user_agent=settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
                )
            else:
                warnings.append("WHOOP token could not be refreshed.")

        if live_strava and live_whoop:
            merged = merge_live_data(live_strava, live_whoop, settings)
            if merged["runs"] and merged["metrics"]:
                profile = merged["profile"]
                runs = merged["runs"]
                metrics = merged["metrics"]
                all_activities = strava_activity_preview(live_strava.get("activities", [])) + whoop_workout_preview(live_whoop)
                logged_activities = list(all_activities)
                activity_feed = list(all_activities)
                activity_feed = _filter_calendar_activities(sorted(activity_feed, key=lambda item: item.get("day", ""), reverse=True))
                live_preview = {
                    "mode": "live",
                    "strava_runs_found": len(runs),
                    "whoop_days_found": len(metrics),
                }
        else:
            if live_strava:
                runs = strava_runs_to_model(live_strava.get("activities", [])) or runs
                all_activities = strava_activity_preview(live_strava.get("activities", []))
                logged_activities = list(all_activities)
                activity_feed = list(all_activities)
            if live_whoop:
                metrics = whoop_metrics_to_model(live_whoop) or metrics
                whoop_activities = whoop_workout_preview(live_whoop)
                if live_strava:
                    all_activities = all_activities + whoop_activities
                    logged_activities = logged_activities + whoop_activities
                    activity_feed = activity_feed + whoop_activities
                elif whoop_activities:
                    all_activities = whoop_activities
                    logged_activities = whoop_activities
                    activity_feed = whoop_activities

            if live_strava or live_whoop:
                activity_feed = _filter_calendar_activities(sorted(activity_feed, key=lambda item: item.get("day", ""), reverse=True))
                live_preview = {
                    "mode": "mixed",
                    "strava_runs_found": len(runs) if live_strava else 0,
                    "whoop_days_found": len(metrics) if live_whoop else 0,
                    "warning": " ".join(warnings) if warnings else "One provider loaded live data while the other fell back.",
                }
    except Exception as exc:
        live_preview = {"mode": "sample", "warning": str(exc)}

    today_iso = safe_iso_today()
    today_date = datetime.strptime(today_iso, "%Y-%m-%d").date()
    weekly_plan_bundle = _load_or_create_weekly_plan(today_date, profile, runs, metrics)
    weekly_intent = WeeklyIntent(**weekly_plan_bundle["weekly_intent"])
    weekly_plan = weekly_plan_bundle["activities"]
    roadmap = build_training_roadmap(today_date, profile, runs, metrics)
    recommendation = None
    recommendation_options: list[dict] = []
    recommended_option_key = ""
    recommendation_meta = {"source": None, "model": None, "reason": None}
    recommendation_feedback = dict(subjective_feedback or {})
    activity_notes = load_activity_notes()
    full_activity_feed = _filter_calendar_activities(sorted(all_activities, key=lambda item: item.get("day", ""), reverse=True))
    full_logged_activity_feed = sorted(logged_activities, key=lambda item: item.get("day", ""), reverse=True)
    annotated_activity_feed = _attach_activity_notes(full_activity_feed, activity_notes)
    annotated_activity_log = _activity_log_payload(_attach_activity_notes(full_logged_activity_feed, activity_notes))
    recommendation_feedback.update(_recommendation_training_context(annotated_activity_feed, today_iso))
    notes_context = _activity_notes_context(
        annotated_activity_log,
        reference_day=today_iso,
        current_feedback=recommendation_feedback,
    )
    if notes_context:
        recommendation_feedback["recent_workout_notes"] = notes_context
    recent_checkin_context = _recent_checkin_context(load_daily_checkins(), today_iso)
    if recent_checkin_context:
        recommendation_feedback["recent_checkin_context"] = recent_checkin_context

    if include_recommendation:
        recommendation, recommendation_meta = llm_recommendation(
            profile,
            runs,
            metrics,
            today=today_date,
            subjective_feedback=recommendation_feedback,
            weekly_intent=weekly_intent,
        )

    payload = {
        "profile": {
            "name": profile.name,
            "goal_race_date": profile.goal_race_date,
            "preferred_long_run_day": profile.preferred_long_run_day,
            "goal_half_marathon_time": profile.goal_half_marathon_time,
            "recent_race_result": profile.recent_race_result,
            "max_comfortable_long_run_miles": profile.max_comfortable_long_run_miles,
            "desired_runs_per_week": profile.desired_runs_per_week,
            "desired_strength_frequency": profile.desired_strength_frequency,
            "preferred_adaptation_emphasis": profile.preferred_adaptation_emphasis,
            "injury_flags": profile.injury_flags,
        },
        "summary": {
            "recent_mileage": recent_mileage(runs),
            "latest_recovery": metrics[-1].recovery_score,
            "latest_sleep_hours": metrics[-1].sleep_hours,
            "latest_strain": metrics[-1].strain,
            "latest_resting_hr": metrics[-1].resting_hr,
            "latest_hrv": metrics[-1].hrv_ms,
            "previous_run": previous_run_summary(runs),
            "current_day_status": _current_day_status(today_iso, annotated_activity_feed, recommendation),
        },
        "recommendation": recommendation.to_dict() if recommendation else None,
        "recommendation_explanation": recommendation_meta.get("recommendation_explanation") if recommendation_meta else None,
        "recommendation_options": recommendation_options,
        "recommended_option_key": recommended_option_key,
        "clarification_questions": [],
        "recommendation_meta": recommendation_meta,
        "weekly_focus": weekly_intent.to_dict(),
        "training_roadmap": roadmap,
        "weekly_plan_key": _week_plan_key(today_date),
        "weekly_plan_generated_from_day": weekly_plan_bundle.get("planned_from_day"),
        "activity_feed": annotated_activity_feed,
        "activity_log": annotated_activity_log,
        "activity_calendar": calendar_days(
            annotated_activity_feed,
            metrics,
            recommendation=recommendation,
            today=today_iso,
            profile=profile,
            weekly_plan=weekly_plan,
        ),
        "connections": {
            "status": connection_status,
            "setup_complete": {
                "strava": bool(settings.get("strava", {}).get("client_id")),
                "whoop": bool(settings.get("whoop", {}).get("client_id")),
            },
            "public_base_url": settings.get("public_base_url", ""),
            "strava_callback_url": strava_redirect_uri(settings.get("public_base_url", "")) if settings.get("public_base_url") else "",
            "whoop_callback_url": whoop_redirect_uri(settings.get("public_base_url", "")) if settings.get("public_base_url") else "",
        },
        "profile_settings": _profile_settings_payload(settings, tokens),
        "data_mode": live_preview,
        "today": today_iso,
    }
    return payload


def html_page(title: str, body: str) -> str:
    return f"""
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{escape(title)}</title>
        <style>
          body {{
            margin: 0;
            padding: 32px;
            font-family: Georgia, "Times New Roman", serif;
            background: linear-gradient(145deg, #f7f0e7, #e6efe8 60%, #dce8e4);
            color: #17211f;
          }}

          main {{
            max-width: 900px;
            margin: 0 auto;
          }}

          .card {{
            background: rgba(255, 251, 245, 0.94);
            border: 1px solid rgba(23, 33, 31, 0.12);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 18px;
          }}

          .button {{
            display: inline-block;
            padding: 12px 16px;
            border-radius: 999px;
            background: #d96c3f;
            color: white;
            text-decoration: none;
            margin-right: 10px;
          }}

          input {{
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            border: 1px solid rgba(23, 33, 31, 0.16);
            margin-top: 6px;
            margin-bottom: 14px;
          }}

          label {{
            font-size: 0.92rem;
          }}
        </style>
      </head>
      <body>
        <main>{body}</main>
      </body>
    </html>
    """


def setup_form(settings: dict, message: str = "") -> str:
    strava = settings.get("strava", {})
    whoop = settings.get("whoop", {})
    hosted_env = using_hosted_env()
    public_base_url = settings.get("public_base_url", "")
    return html_page(
        "Setup",
        f"""
        <div class="card">
          <h1>App Setup</h1>
          <p>This page stores your app IDs and secrets on your own computer so you do not need to type them into Terminal.</p>
          <p><strong>{'Hosted environment variables are active. You can still save app settings here, but environment-backed values may override local saves after refresh.' if hosted_env else 'Right now the app is using local settings saved on this machine.'}</strong></p>
          {f"<p><strong>{escape(message)}</strong></p>" if message else ""}
        </div>

        <form method="POST" action="/setup" class="card">
          <h2>About You</h2>
          <label>Athlete name
            <input name="athlete_name" value="{escape(settings.get("athlete_name", ""))}" />
          </label>
          <label>Goal race date (example: 2026-05-10)
            <input name="goal_race_date" value="{escape(settings.get("goal_race_date", ""))}" />
          </label>
          <label>Preferred long run day
            <input name="preferred_long_run_day" value="{escape(settings.get("preferred_long_run_day", "Sunday"))}" />
          </label>
          <label>Goal half marathon time
            <input name="goal_half_marathon_time" value="{escape(settings.get("goal_half_marathon_time", ""))}" />
          </label>
          <label>Recent race result or benchmark
            <input name="recent_race_result" value="{escape(settings.get("recent_race_result", ""))}" />
          </label>
          <label>Max comfortable long run (miles)
            <input name="max_comfortable_long_run_miles" value="{escape(str(settings.get("max_comfortable_long_run_miles", "")))}" />
          </label>
          <label>Desired runs per week
            <input name="desired_runs_per_week" value="{escape(str(settings.get("desired_runs_per_week", "5")))}" />
          </label>
          <label>Desired strength sessions per week
            <input name="desired_strength_frequency" value="{escape(str(settings.get("desired_strength_frequency", "2")))}" />
          </label>
          <label>Preferred adaptation emphasis
            <input name="preferred_adaptation_emphasis" value="{escape(settings.get("preferred_adaptation_emphasis", ""))}" />
          </label>
          <label>Injury or niggle flags
            <input name="injury_flags" value="{escape(settings.get("injury_flags", ""))}" />
          </label>

          <h2>Strava</h2>
          <label>Strava client ID
            <input name="strava_client_id" value="{escape(strava.get("client_id", ""))}" />
          </label>
          <label>Strava client secret
            <input name="strava_client_secret" value="{escape(strava.get("client_secret", ""))}" />
          </label>

          <h2>WHOOP</h2>
          <label>WHOOP client ID
            <input name="whoop_client_id" value="{escape(whoop.get("client_id", ""))}" />
          </label>
          <label>WHOOP client secret
            <input name="whoop_client_secret" value="{escape(whoop.get("client_secret", ""))}" />
          </label>
          <label>Public base URL (local example: https://your-name.ngrok-free.dev, hosted example: https://your-app.onrender.com)
            <input name="public_base_url" value="{escape(public_base_url)}" />
          </label>
          <label>
            <input type="checkbox" name="allow_insecure_ssl" {"checked" if settings.get("allow_insecure_ssl") else ""} style="width:auto; margin-right:8px;" />
            Allow insecure SSL for local development only
          </label>
          <p>This is only for cases where your network adds its own certificate and Python refuses the connection.</p>

          <button type="submit">Save setup</button>
        </form>

        <div class="card">
          <h2>Useful Callback URLs</h2>
          <p><strong>Strava:</strong> {escape(strava_redirect_uri(public_base_url) if public_base_url else "Add your public base URL above to generate this")}</p>
          <p><strong>WHOOP:</strong> {escape(whoop_redirect_uri(public_base_url) if public_base_url else "Add your public base URL above to generate this")}</p>
          <p><a class="button" href="/">Back to dashboard</a></p>
        </div>
        """,
    )


def callback_success_page(provider: str, preview: dict) -> str:
    latest = preview.get("latest_item")
    latest_html = f"<pre>{escape(json.dumps(latest, indent=2))}</pre>" if latest else "<p>No sample item was returned yet.</p>"
    return html_page(
        f"{provider} Connected",
        f"""
        <div class="card">
          <h1>{escape(provider)} connected</h1>
          <p>The app successfully completed the login return step and saved your token locally.</p>
        </div>
        <div class="card">
          <h2>What the app just imported</h2>
          <p><strong>Provider:</strong> {escape(preview.get("provider", provider))}</p>
          <p><strong>Name on account:</strong> {escape(preview.get("athlete_name", "") or "Not returned")}</p>
          <p><strong>Items found:</strong> {preview.get("items_found", 0)}</p>
          {latest_html}
        </div>
        <div class="card">
          <a class="button" href="/">Back to dashboard</a>
          <a class="button" href="/setup">Open setup</a>
        </div>
        """,
    )


def callback_warning_page(title: str, details: str) -> str:
    return html_page(
        title,
        f"""
        <div class="card">
          <h1>{escape(title)}</h1>
          <p>{escape(details)}</p>
          <p>This relaxed check is only for local development while we get your connection working.</p>
        </div>
        <div class="card">
          <a class="button" href="/">Back to dashboard</a>
          <a class="button" href="/setup">Open setup</a>
        </div>
        """,
    )


def error_page(title: str, details: str) -> str:
    return html_page(
        title,
        f"""
        <div class="card">
          <h1>{escape(title)}</h1>
          <p>{escape(details)}</p>
          <p><a class="button" href="/setup">Open setup</a> <a class="button" href="/">Back to dashboard</a></p>
        </div>
        """,
    )


def debug_query_summary(query: dict[str, list[str]]) -> str:
    safe_query = {key: values for key, values in query.items()}
    return escape(json.dumps(safe_query, indent=2))


class CoachHandler(BaseHTTPRequestHandler):
    def _send_file(self, path: Path, content_type: str | None = None) -> None:
        body = path.read_bytes()
        self.send_response(200)
        resolved_type = content_type or mimetypes.guess_type(str(path))[0] or "application/octet-stream"
        if resolved_type.startswith("text/") or resolved_type in {"application/javascript", "application/json"}:
            resolved_type = f"{resolved_type}; charset=utf-8"
        self.send_header("Content-Type", resolved_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_html_file(self, filename: str) -> None:
        react_path = FRONTEND_DIST_DIR / filename
        static_path = STATIC_DIR / filename
        if react_path.exists():
            self._send_file(react_path, content_type="text/html")
            return
        self._send_file(static_path, content_type="text/html")

    def _send_html_text(self, body: str, status: int = 200) -> None:
        encoded = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def _redirect(self, location: str) -> None:
        self.send_response(302)
        self.send_header("Location", location)
        self.end_headers()

    def _read_form(self) -> dict[str, str]:
        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length).decode("utf-8")
        parsed = parse_qs(body)
        return {key: values[0] for key, values in parsed.items()}

    def _read_json(self) -> dict:
        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length).decode("utf-8")
        return json.loads(body or "{}")

    def _connected_status(self, settings: dict, tokens: dict) -> dict:
        return {
            "strava": bool(settings.get("strava", {}).get("client_id")) and bool(tokens.get("strava")),
            "whoop": bool(settings.get("whoop", {}).get("client_id")) and bool(tokens.get("whoop")),
        }

    def do_POST(self) -> None:
        if self.path == "/api/profile-settings":
            settings = load_settings()
            tokens = load_tokens()
            try:
                payload = self._read_json()
            except Exception:
                self._send_json({"error": "Invalid JSON body."}, status=400)
                return

            settings = _settings_from_json_payload(settings, payload)
            save_settings(settings)
            self._send_json({"ok": True, "profile_settings": _profile_settings_payload(settings, tokens)})
            return

        if self.path == "/api/recommendation":
            settings = load_settings()
            tokens = load_tokens()
            try:
                form = self._read_json()
            except Exception:
                self._send_json({"error": "Invalid JSON body."}, status=400)
                return

            payload = build_dashboard_payload(
                settings,
                tokens,
                subjective_feedback={
                    "physical_feeling": str(form.get("physical_feeling", "")).strip(),
                    "mental_feeling": str(form.get("mental_feeling", "")).strip(),
                    "notes": str(form.get("notes", "")).strip(),
                    "has_pain": bool(form.get("has_pain")),
                    "pain_severity": str(form.get("pain_severity", "")).strip(),
                    "pain_location": str(form.get("pain_location", "")).strip(),
                    "pain_with_running": bool(form.get("pain_with_running")),
                    "pain_with_walking": bool(form.get("pain_with_walking")),
                    "pain_with_cycling": form.get("pain_with_cycling") if isinstance(form.get("pain_with_cycling"), bool) else None,
                    "clarification_answers": form.get("clarification_answers", {}) if isinstance(form.get("clarification_answers"), dict) else {},
                },
                include_recommendation=True,
            )
            save_daily_checkin(
                safe_iso_today(),
                {
                    "physical_feeling": str(form.get("physical_feeling", "")).strip(),
                    "mental_feeling": str(form.get("mental_feeling", "")).strip(),
                    "notes": str(form.get("notes", "")).strip(),
                    "has_pain": bool(form.get("has_pain")),
                    "pain_severity": str(form.get("pain_severity", "")).strip(),
                    "pain_location": str(form.get("pain_location", "")).strip(),
                    "pain_with_running": bool(form.get("pain_with_running")),
                    "pain_with_walking": bool(form.get("pain_with_walking")),
                    "pain_with_cycling": form.get("pain_with_cycling") if isinstance(form.get("pain_with_cycling"), bool) else None,
                    "planned_skip_today": _planned_skip_today(
                        {
                            "notes": str(form.get("notes", "")).strip(),
                        }
                    ),
                },
            )
            self._send_json(payload)
            return

        if self.path == "/api/activity-notes":
            try:
                form = self._read_json()
            except Exception:
                self._send_json({"error": "Invalid JSON body."}, status=400)
                return

            activity_key = str(form.get("activity_key", "")).strip()
            note = str(form.get("note", "")).strip()
            if not activity_key:
                self._send_json({"error": "Activity key is required."}, status=400)
                return
            save_activity_note(activity_key, note)
            settings = load_settings()
            tokens = load_tokens()
            payload = build_dashboard_payload(settings, tokens)
            self._send_json(payload)
            return

        if self.path != "/setup":
            self._send_html_text(error_page("Not found", "That form target does not exist."), status=404)
            return

        form = self._read_form()
        settings = _settings_from_json_payload(
            load_settings(),
            {
                "athlete_name": form.get("athlete_name", ""),
                "goal_race_date": form.get("goal_race_date", ""),
                "preferred_long_run_day": form.get("preferred_long_run_day", "Sunday"),
                "goal_half_marathon_time": form.get("goal_half_marathon_time", ""),
                "recent_race_result": form.get("recent_race_result", ""),
                "max_comfortable_long_run_miles": form.get("max_comfortable_long_run_miles", ""),
                "desired_runs_per_week": form.get("desired_runs_per_week", "5"),
                "desired_strength_frequency": form.get("desired_strength_frequency", "2"),
                "preferred_adaptation_emphasis": form.get("preferred_adaptation_emphasis", ""),
                "injury_flags": form.get("injury_flags", ""),
                "public_base_url": form.get("public_base_url", ""),
                "allow_insecure_ssl": form.get("allow_insecure_ssl") == "on",
                "strava_client_id": form.get("strava_client_id", ""),
                "strava_client_secret": form.get("strava_client_secret", ""),
                "whoop_client_id": form.get("whoop_client_id", ""),
                "whoop_client_secret": form.get("whoop_client_secret", ""),
            },
        )
        save_settings(settings)
        self._send_html_text(setup_form(settings, message="Saved. You can go back and press Connect now."))

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query)
        settings = load_settings()
        tokens = load_tokens()
        states = load_states()

        if parsed.path.startswith("/assets/"):
            asset_path = FRONTEND_DIST_DIR / parsed.path.lstrip("/")
            if asset_path.exists() and asset_path.is_file():
                self._send_file(asset_path)
                return

        if parsed.path == "/":
            self._send_html_file("index.html")
            return

        if parsed.path == "/setup":
            self._send_html_text(setup_form(settings))
            return

        if parsed.path == "/api/profile-settings":
            self._send_json({"profile_settings": _profile_settings_payload(settings, tokens)})
            return

        if parsed.path == "/connect/strava":
            client_id = settings.get("strava", {}).get("client_id", "")
            public_base_url = settings.get("public_base_url", "")
            if not client_id:
                self._send_html_text(error_page("Missing Strava setup", "Open Setup and add your Strava client ID and client secret first."))
                return
            if not public_base_url:
                self._send_html_text(error_page("Missing public URL", "Open Setup and add your app's public base URL first."))
                return

            state = generate_state()
            states["strava"] = state
            save_states(states)
            self._redirect(build_strava_authorize_url(client_id, public_base_url, state))
            return

        if parsed.path == "/connect/whoop":
            client_id = settings.get("whoop", {}).get("client_id", "")
            public_base_url = settings.get("public_base_url", "")
            if not client_id or not public_base_url:
                self._send_html_text(error_page("Missing WHOOP setup", "Open Setup and add your WHOOP client ID, client secret, and ngrok public URL first."))
                return

            state = generate_state()
            states["whoop"] = state
            save_states(states)
            self._redirect(build_whoop_authorize_url(client_id, public_base_url, state))
            return

        if parsed.path == "/strava/callback":
            if query.get("state", [""])[0] != states.get("strava", ""):
                self._send_html_text(error_page("Strava state mismatch", "The app could not verify that this login return belongs to your current session. Please try Connect Strava again."))
                return

            code = query.get("code", [""])[0]
            if not code:
                self._send_html_text(error_page("Missing Strava code", "Strava returned without an authorization code."))
                return

            try:
                provider_settings = settings.get("strava", {})
                public_base_url = settings.get("public_base_url", "")
                token_payload = exchange_strava_code(
                    provider_settings["client_id"],
                    provider_settings["client_secret"],
                    strava_redirect_uri(public_base_url),
                    code,
                    allow_insecure_ssl=bool(settings.get("allow_insecure_ssl")),
                    user_agent=settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
                )
                tokens["strava"] = token_payload
                save_tokens(tokens)
                snapshot = fetch_strava_snapshot(
                    token_payload["access_token"],
                    allow_insecure_ssl=bool(settings.get("allow_insecure_ssl")),
                    user_agent=settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
                )
                self._send_html_text(callback_success_page("Strava", snapshot_preview("strava", snapshot)))
            except Exception as exc:
                self._send_html_text(error_page("Strava connection failed", str(exc)), status=500)
            return

        if parsed.path == "/whoop/callback":
            code = query.get("code", [""])[0]
            if not code:
                details = "WHOOP returned without an authorization code."
                debug_html = html_page(
                    "Missing WHOOP code",
                    f"""
                    <div class="card">
                      <h1>Missing WHOOP code</h1>
                      <p>{escape(details)}</p>
                      <p>This means WHOOP reached your app, but did not include the login code needed to finish the connection.</p>
                    </div>
                    <div class="card">
                      <h2>What WHOOP sent back</h2>
                      <pre>{debug_query_summary(query)}</pre>
                    </div>
                    <div class="card">
                      <a class="button" href="/">Back to dashboard</a>
                      <a class="button" href="/setup">Open setup</a>
                    </div>
                    """,
                )
                self._send_html_text(debug_html)
                return

            returned_state = query.get("state", [""])[0]
            expected_state = states.get("whoop", "")
            state_warning = ""
            if expected_state and returned_state and returned_state != expected_state:
                state_warning = "WHOOP returned a different state value than expected, so the app is continuing in relaxed local development mode."
            elif expected_state and not returned_state:
                state_warning = "WHOOP did not return a state value, so the app is continuing in relaxed local development mode."

            try:
                provider_settings = settings.get("whoop", {})
                redirect_uri = whoop_redirect_uri(settings.get("public_base_url", ""))
                token_payload = exchange_whoop_code(
                    provider_settings["client_id"],
                    provider_settings["client_secret"],
                    redirect_uri,
                    code,
                    allow_insecure_ssl=bool(settings.get("allow_insecure_ssl")),
                    user_agent=settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
                )
                tokens["whoop"] = token_payload
                save_tokens(tokens)
                snapshot = fetch_whoop_snapshot(
                    token_payload["access_token"],
                    allow_insecure_ssl=bool(settings.get("allow_insecure_ssl")),
                    user_agent=settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
                )
                body = callback_success_page("WHOOP", snapshot_preview("whoop", snapshot))
                if state_warning:
                    body = body.replace(
                        "<div class=\"card\">\n          <h2>What the app just imported</h2>",
                        f"<div class=\"card\"><p><strong>{escape(state_warning)}</strong></p></div><div class=\"card\">\n          <h2>What the app just imported</h2>",
                    )
                self._send_html_text(body)
            except Exception as exc:
                self._send_html_text(error_page("WHOOP connection failed", str(exc)), status=500)
            return

        if parsed.path == "/api/dashboard":
            query = parse_qs(parsed.query)
            include_recommendation = query.get("include_recommendation", ["0"])[0].lower() in {"1", "true", "yes"}
            payload = build_dashboard_payload(settings, tokens, include_recommendation=include_recommendation)
            self._send_json(payload)
            return

        frontend_index = FRONTEND_DIST_DIR / "index.html"
        if frontend_index.exists() and not parsed.path.startswith("/api/"):
            self._send_file(frontend_index, content_type="text/html")
            return

        self._send_html_text(error_page("Not found", "That page does not exist."), status=404)


def run_server(host: str = "127.0.0.1", port: int = 8000) -> None:
    server = HTTPServer((host, port), CoachHandler)
    print(f"Serving adaptive run coach at http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    init_storage()
    default_host = "0.0.0.0" if os.environ.get("PORT") else "127.0.0.1"
    run_server(
        host=os.environ.get("HOST", default_host),
        port=int(os.environ.get("PORT", "8000")),
    )
