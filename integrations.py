from __future__ import annotations

import json
import secrets
import ssl
import time
from dataclasses import asdict
from datetime import UTC, date, datetime, timedelta
import os
from zoneinfo import ZoneInfo
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from coach import AthleteProfile, RecoveryMetrics, Run


STRAVA_SCOPES = "read,activity:read_all,profile:read_all"
WHOOP_SCOPES = "read:recovery read:cycles read:sleep read:workout offline"


class OAuthError(Exception):
    pass


def generate_state() -> str:
    # WHOOP requires at least 8 characters.
    return secrets.token_urlsafe(12)


def strava_redirect_uri(public_base_url: str) -> str:
    return public_base_url.rstrip("/") + "/strava/callback"


def whoop_redirect_uri(public_base_url: str) -> str:
    return public_base_url.rstrip("/") + "/whoop/callback"


def build_strava_authorize_url(client_id: str, public_base_url: str, state: str) -> str:
    query = urlencode(
        {
            "client_id": client_id,
            "redirect_uri": strava_redirect_uri(public_base_url),
            "response_type": "code",
            "approval_prompt": "auto",
            "scope": STRAVA_SCOPES,
            "state": state,
        }
    )
    return "https://www.strava.com/oauth/authorize?" + query


def build_whoop_authorize_url(client_id: str, public_base_url: str, state: str) -> str:
    query = urlencode(
        {
            "client_id": client_id,
            "redirect_uri": whoop_redirect_uri(public_base_url),
            "response_type": "code",
            "scope": WHOOP_SCOPES,
            "state": state,
        }
    )
    return "https://api.prod.whoop.com/oauth/oauth2/auth?" + query


def _ssl_context(allow_insecure_ssl: bool):
    if allow_insecure_ssl:
        return ssl._create_unverified_context()
    return None


def _app_timezone() -> ZoneInfo:
    timezone_name = os.environ.get("APP_TIMEZONE", "").strip() or os.environ.get("TZ", "").strip() or "America/New_York"
    try:
        return ZoneInfo(timezone_name)
    except Exception:
        return ZoneInfo("America/New_York")


def _local_iso_date(value: str) -> str:
    text = str(value or "").strip()
    if not text:
        return ""
    try:
        dt = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except Exception:
        return text[:10]
    if dt.tzinfo is None:
        return dt.date().isoformat()
    return dt.astimezone(_app_timezone()).date().isoformat()


def _http_error_details(exc: HTTPError) -> str:
    try:
        body = exc.read().decode("utf-8")
    except Exception:
        body = ""
    if body:
        return f"HTTP {exc.code}: {body}"
    return f"HTTP {exc.code}: {exc.reason}"


def _post_form(
    url: str,
    payload: dict[str, str],
    allow_insecure_ssl: bool = False,
    user_agent: str = "AdaptiveRunningCoach/0.1",
) -> dict:
    body = urlencode(payload).encode("utf-8")
    request = Request(
        url,
        data=body,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
            "User-Agent": user_agent,
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=30, context=_ssl_context(allow_insecure_ssl)) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        raise OAuthError(_http_error_details(exc)) from exc


def _get_json(
    url: str,
    access_token: str,
    allow_insecure_ssl: bool = False,
    user_agent: str = "AdaptiveRunningCoach/0.1",
) -> dict | list:
    request = Request(
        url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "User-Agent": user_agent,
        },
    )
    try:
        with urlopen(request, timeout=30, context=_ssl_context(allow_insecure_ssl)) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        raise OAuthError(_http_error_details(exc)) from exc


def exchange_strava_code(
    client_id: str,
    client_secret: str,
    redirect_uri: str,
    code: str,
    allow_insecure_ssl: bool = False,
    user_agent: str = "AdaptiveRunningCoach/0.1",
) -> dict:
    payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "code": code,
        "grant_type": "authorization_code",
    }
    tokens = _post_form(
        "https://www.strava.com/oauth/token",
        payload,
        allow_insecure_ssl=allow_insecure_ssl,
        user_agent=user_agent,
    )
    tokens["saved_at"] = int(time.time())
    return tokens


def exchange_whoop_code(
    client_id: str,
    client_secret: str,
    redirect_uri: str,
    code: str,
    allow_insecure_ssl: bool = False,
    user_agent: str = "AdaptiveRunningCoach/0.1",
) -> dict:
    payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": redirect_uri,
    }
    tokens = _post_form(
        "https://api.prod.whoop.com/oauth/oauth2/token",
        payload,
        allow_insecure_ssl=allow_insecure_ssl,
        user_agent=user_agent,
    )
    tokens["saved_at"] = int(time.time())
    return tokens


def refresh_strava_token(
    client_id: str,
    client_secret: str,
    refresh_token: str,
    allow_insecure_ssl: bool = False,
    user_agent: str = "AdaptiveRunningCoach/0.1",
) -> dict:
    payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }
    tokens = _post_form(
        "https://www.strava.com/oauth/token",
        payload,
        allow_insecure_ssl=allow_insecure_ssl,
        user_agent=user_agent,
    )
    tokens["saved_at"] = int(time.time())
    return tokens


def refresh_whoop_token(
    client_id: str,
    client_secret: str,
    refresh_token: str,
    allow_insecure_ssl: bool = False,
    user_agent: str = "AdaptiveRunningCoach/0.1",
) -> dict:
    payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "offline",
    }
    tokens = _post_form(
        "https://api.prod.whoop.com/oauth/oauth2/token",
        payload,
        allow_insecure_ssl=allow_insecure_ssl,
        user_agent=user_agent,
    )
    tokens["saved_at"] = int(time.time())
    return tokens


def valid_access_token(provider: str, settings: dict, tokens: dict) -> dict | None:
    provider_tokens = tokens.get(provider)
    if not provider_tokens:
        return None

    now = int(time.time())
    allow_insecure_ssl = bool(settings.get("allow_insecure_ssl"))
    user_agent = settings.get("app_user_agent", "AdaptiveRunningCoach/0.1")
    if provider == "strava":
        expires_at = int(provider_tokens.get("expires_at", 0))
        if expires_at > now + 300:
            return provider_tokens

        refresh_token = provider_tokens.get("refresh_token")
        if not refresh_token:
            return provider_tokens

        refreshed = refresh_strava_token(
            settings["strava"]["client_id"],
            settings["strava"]["client_secret"],
            refresh_token,
            allow_insecure_ssl=allow_insecure_ssl,
            user_agent=user_agent,
        )
        refreshed["athlete"] = provider_tokens.get("athlete", {})
        return refreshed

    expires_in = int(provider_tokens.get("expires_in", 0))
    saved_at = int(provider_tokens.get("saved_at", 0))
    if saved_at + expires_in > now + 300:
        return provider_tokens

    refresh_token = provider_tokens.get("refresh_token")
    if not refresh_token:
        return provider_tokens

    return refresh_whoop_token(
        settings["whoop"]["client_id"],
        settings["whoop"]["client_secret"],
        refresh_token,
        allow_insecure_ssl=allow_insecure_ssl,
        user_agent=user_agent,
    )


def fetch_strava_snapshot(
    access_token: str,
    allow_insecure_ssl: bool = False,
    user_agent: str = "AdaptiveRunningCoach/0.1",
) -> dict:
    athlete = _get_json(
        "https://www.strava.com/api/v3/athlete",
        access_token,
        allow_insecure_ssl=allow_insecure_ssl,
        user_agent=user_agent,
    )
    activities = _get_json(
        "https://www.strava.com/api/v3/athlete/activities?per_page=50&page=1",
        access_token,
        allow_insecure_ssl=allow_insecure_ssl,
        user_agent=user_agent,
    )
    return {"athlete": athlete, "activities": activities}


def fetch_whoop_snapshot(
    access_token: str,
    allow_insecure_ssl: bool = False,
    user_agent: str = "AdaptiveRunningCoach/0.1",
) -> dict:
    profile = {}
    try:
        profile = _get_json(
            "https://api.prod.whoop.com/developer/v2/user/profile/basic",
            access_token,
            allow_insecure_ssl=allow_insecure_ssl,
            user_agent=user_agent,
        )
    except Exception:
        # Profile access is optional for this app; recovery and workout data are the important parts.
        profile = {}
    try:
        recoveries = _get_json(
            "https://api.prod.whoop.com/developer/v2/recovery?limit=25",
            access_token,
            allow_insecure_ssl=allow_insecure_ssl,
            user_agent=user_agent,
        )
    except HTTPError as exc:
        raise RuntimeError(f"WHOOP recovery request failed with HTTP {exc.code}. Check that read:recovery is enabled in your WHOOP app.") from exc
    try:
        sleeps = _get_json(
            "https://api.prod.whoop.com/developer/v2/activity/sleep?limit=25",
            access_token,
            allow_insecure_ssl=allow_insecure_ssl,
            user_agent=user_agent,
        )
    except HTTPError as exc:
        raise RuntimeError(f"WHOOP sleep request failed with HTTP {exc.code}. Check that read:sleep is enabled in your WHOOP app.") from exc
    try:
        cycles = _get_json(
            "https://api.prod.whoop.com/developer/v2/cycle?limit=25",
            access_token,
            allow_insecure_ssl=allow_insecure_ssl,
            user_agent=user_agent,
        )
    except HTTPError as exc:
        raise RuntimeError(f"WHOOP cycle request failed with HTTP {exc.code}. Check that read:cycles is enabled in your WHOOP app.") from exc
    try:
        workouts = _get_json(
            "https://api.prod.whoop.com/developer/v2/activity/workout?limit=25",
            access_token,
            allow_insecure_ssl=allow_insecure_ssl,
            user_agent=user_agent,
        )
    except HTTPError as exc:
        raise RuntimeError(f"WHOOP workout request failed with HTTP {exc.code}. Check that read:workout is enabled in your WHOOP app.") from exc
    return {
        "profile": profile,
        "recoveries": recoveries,
        "sleeps": sleeps,
        "cycles": cycles,
        "workouts": workouts,
    }


def _effort_from_activity(activity: dict) -> str:
    name = (activity.get("name") or "").lower()
    if any(keyword in name for keyword in ("tempo", "interval", "race", "threshold")):
        return "hard"

    if activity.get("sport_type") == "Run" or activity.get("type") == "Run":
        distance_miles = _strava_activity_distance_miles(activity)
        duration_minutes = max(1, int(activity.get("moving_time", 0) / 60))
        pace = duration_minutes / distance_miles if distance_miles > 0 else 0.0

        # Fast 5k-ish efforts are usually strenuous even when the activity name is generic.
        if distance_miles >= 3.0 and 0 < pace <= 7.75:
            return "hard"
        if distance_miles >= 6.0 and 0 < pace <= 8.75:
            return "hard"
        if distance_miles >= 3.0 and 0 < pace <= 9.25:
            return "moderate"
        if activity.get("distance", 0) >= 15000:
            return "moderate"

    return "easy"


def _strava_activity_day(activity: dict) -> str:
    start = activity.get("start_date_local") or activity.get("start_date") or ""
    return start[:10]


def _strava_activity_distance_miles(activity: dict) -> float:
    return round(float(activity.get("distance", 0)) * 0.000621371, 2)


def _looks_like_whoop_synced_run(activity: dict) -> bool:
    markers = [
        activity.get("device_name"),
        activity.get("external_id"),
        activity.get("source"),
        activity.get("description"),
    ]
    return "whoop" in " ".join(str(marker or "").lower() for marker in markers)


def _likely_duplicate_short_run_days(activities: list[dict]) -> set[str]:
    long_run_days: set[str] = set()
    for activity in activities:
        if activity.get("type") != "Run" and activity.get("sport_type") != "Run":
            continue
        day = _strava_activity_day(activity)
        if day and _strava_activity_distance_miles(activity) >= 1.0:
            long_run_days.add(day)
    return long_run_days


def _skip_strava_run_activity(activity: dict, duplicate_short_run_days: set[str]) -> bool:
    if activity.get("type") != "Run" and activity.get("sport_type") != "Run":
        return False

    if _looks_like_whoop_synced_run(activity):
        return True

    day = _strava_activity_day(activity)
    distance_miles = _strava_activity_distance_miles(activity)
    return bool(day and day in duplicate_short_run_days and distance_miles <= 0.25)


def strava_runs_to_model(activities: list[dict]) -> list[Run]:
    runs: list[Run] = []
    duplicate_short_run_days = _likely_duplicate_short_run_days(activities)
    for activity in activities:
        if activity.get("type") != "Run" and activity.get("sport_type") != "Run":
            continue
        if _skip_strava_run_activity(activity, duplicate_short_run_days):
            continue

        start = activity.get("start_date_local") or activity.get("start_date")
        if not start:
            continue

        distance_miles = _strava_activity_distance_miles(activity)
        duration_minutes = max(1, int(activity.get("moving_time", 0) / 60))
        average_pace = round(duration_minutes / distance_miles, 2) if distance_miles > 0 else 0.0

        runs.append(
            Run(
                day=start[:10],
                distance_miles=distance_miles,
                duration_minutes=duration_minutes,
                effort=_effort_from_activity(activity),
                workout_type=(activity.get("name") or "run").lower().replace(" ", "_"),
                average_pace_min_per_mile=average_pace,
                source="strava",
            )
        )
    return runs


def strava_activity_preview(activities: list[dict]) -> list[dict]:
    previews: list[dict] = []
    duplicate_short_run_days = _likely_duplicate_short_run_days(activities)
    for activity in activities:
        if _skip_strava_run_activity(activity, duplicate_short_run_days):
            continue
        distance_miles = _strava_activity_distance_miles(activity)
        duration_minutes = max(1, int(activity.get("moving_time", 0) / 60))
        pace = round(duration_minutes / distance_miles, 2) if distance_miles > 0 else 0.0
        sport = activity.get("sport_type") or activity.get("type") or "Activity"
        start_time = activity.get("start_date_local") or activity.get("start_date") or ""
        end_time = ""
        if start_time and activity.get("moving_time"):
            try:
                start_dt = datetime.fromisoformat(str(start_time).replace("Z", "+00:00"))
                end_time = (start_dt + timedelta(seconds=int(activity.get("moving_time") or 0))).isoformat()
            except Exception:
                end_time = ""
        previews.append(
            {
                "source": "Strava",
                "name": sport,
                "day": (activity.get("start_date_local") or activity.get("start_date") or "")[:10],
                "sport": sport,
                "raw_type": activity.get("type") or activity.get("sport_type") or sport,
                "source_title": activity.get("name") or sport,
                "source_id": activity.get("id"),
                "start_time": start_time,
                "end_time": end_time,
                "distance_miles": distance_miles,
                "duration_minutes": duration_minutes,
                "average_pace_min_per_mile": pace,
                "intensity": _effort_from_activity(activity),
            }
        )
    return previews


def whoop_metrics_to_model(snapshot: dict) -> list[RecoveryMetrics]:
    sleeps = {
        (item.get("end") or item.get("created_at") or "")[:10]: item
        for item in snapshot.get("sleeps", {}).get("records", [])
    }
    cycles = {
        (item.get("end") or item.get("created_at") or "")[:10]: item
        for item in snapshot.get("cycles", {}).get("records", [])
    }

    metrics: list[RecoveryMetrics] = []
    for recovery in snapshot.get("recoveries", {}).get("records", []):
        day = (recovery.get("created_at") or recovery.get("updated_at") or "")[:10]
        if not day:
            sleep_id = recovery.get("sleep_id")
            if sleep_id:
                matching_sleep = next(
                    (item for item in snapshot.get("sleeps", {}).get("records", []) if item.get("id") == sleep_id),
                    {},
                )
                day = (matching_sleep.get("end") or matching_sleep.get("created_at") or "")[:10]
        if not day:
            continue

        sleep = sleeps.get(day, {})
        cycle = cycles.get(day, {})
        score = recovery.get("score", {})
        cycle_score = cycle.get("score", {})

        asleep_ms = (
            sleep.get("score", {}).get("stage_summary", {}).get("total_in_bed_time_milli")
            or sleep.get("score", {}).get("sleep_needed", {}).get("sleep_needed_milli")
            or 0
        )

        metrics.append(
            RecoveryMetrics(
                day=day,
                recovery_score=int(score.get("recovery_score", 0)),
                sleep_hours=round(asleep_ms / 3_600_000, 2),
                resting_hr=int(score.get("resting_heart_rate", 0)),
                hrv_ms=int(score.get("hrv_rmssd_milli", 0) / 1000),
                strain=round(float(cycle_score.get("strain", 0.0)), 1),
            )
        )

    metrics.sort(key=lambda item: item.day)
    return metrics


def whoop_workout_preview(snapshot: dict) -> list[dict]:
    previews: list[dict] = []
    for workout in snapshot.get("workouts", {}).get("records", []):
        start = workout.get("start") or workout.get("created_at") or ""
        end = workout.get("end") or workout.get("updated_at") or ""
        sport_name = (
            workout.get("sport_name")
            or workout.get("activity_name")
            or workout.get("workout_type")
            or "Workout"
        )
        strain = workout.get("score", {}).get("strain")
        duration_minutes = 0
        if start and end:
            try:
                start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
                end_dt = datetime.fromisoformat(end.replace("Z", "+00:00"))
                duration_minutes = max(1, int((end_dt - start_dt).total_seconds() / 60))
            except Exception:
                duration_minutes = 0

        previews.append(
            {
                "source": "WHOOP",
                "name": sport_name,
                "day": _local_iso_date(start),
                "sport": sport_name,
                "raw_type": workout.get("workout_type") or workout.get("activity_name") or sport_name,
                "source_title": workout.get("sport_name") or workout.get("activity_name") or sport_name,
                "source_id": workout.get("id"),
                "start_time": start,
                "end_time": end,
                "distance_miles": 0,
                "duration_minutes": duration_minutes,
                "average_pace_min_per_mile": 0,
                "strain": round(float(strain), 1) if strain is not None else None,
            }
        )
    return previews


def _safe_int(value, default: int) -> int:
    try:
        return int(str(value).strip())
    except Exception:
        return default


def _safe_float(value, default: float) -> float:
    text = str(value).strip()
    if not text:
        return default
    try:
        return float(text)
    except Exception:
        digits = "".join(char for char in text if char.isdigit() or char == ".")
        try:
            return float(digits) if digits else default
        except Exception:
            return default


def profile_from_settings(settings: dict) -> AthleteProfile:
    goal_race_date = settings.get("goal_race_date") or (date.today().replace(month=5, day=10).isoformat())
    desired_runs = _safe_int(settings.get("desired_runs_per_week") or 5, 5)
    comfortable_long_run = _safe_float(settings.get("max_comfortable_long_run_miles") or 0.0, 0.0)
    weekly_target = int(round(max(comfortable_long_run * 3.0 if comfortable_long_run else 0.0, desired_runs * 5.0, 20.0)))
    return AthleteProfile(
        name=settings.get("athlete_name") or "Runner",
        goal_race_date=goal_race_date,
        weekly_mileage_target=weekly_target,
        preferred_long_run_day=settings.get("preferred_long_run_day") or "Sunday",
        goal_half_marathon_time=settings.get("goal_half_marathon_time") or "",
        recent_race_result=settings.get("recent_race_result") or "",
        max_comfortable_long_run_miles=_safe_float(settings.get("max_comfortable_long_run_miles") or 0.0, 0.0),
        desired_runs_per_week=_safe_int(settings.get("desired_runs_per_week") or 5, 5),
        desired_strength_frequency=_safe_int(settings.get("desired_strength_frequency") or 2, 2),
        preferred_adaptation_emphasis=settings.get("preferred_adaptation_emphasis") or "",
        injury_flags=settings.get("injury_flags") or "",
    )


def snapshot_preview(provider: str, snapshot: dict) -> dict:
    if provider == "strava":
        athlete = snapshot.get("athlete", {})
        activities = snapshot.get("activities", [])
        runs = strava_runs_to_model(activities)
        return {
            "provider": "Strava",
            "athlete_name": athlete.get("firstname", "") + " " + athlete.get("lastname", ""),
            "items_found": len(runs),
            "latest_item": asdict(runs[0]) if runs else None,
        }

    profile = snapshot.get("profile", {})
    metrics = whoop_metrics_to_model(snapshot)
    return {
        "provider": "WHOOP",
        "athlete_name": (profile.get("first_name", "") + " " + profile.get("last_name", "")).strip(),
        "items_found": len(metrics),
        "latest_item": asdict(metrics[-1]) if metrics else None,
    }


def merge_live_data(strava_snapshot: dict, whoop_snapshot: dict, settings: dict) -> dict:
    runs = strava_runs_to_model(strava_snapshot.get("activities", []))
    metrics = whoop_metrics_to_model(whoop_snapshot)
    profile = profile_from_settings(settings)
    return {
        "profile": profile,
        "runs": runs,
        "metrics": metrics,
    }


def safe_iso_today() -> str:
    try:
        return datetime.now(_app_timezone()).date().isoformat()
    except Exception:
        return datetime.now(UTC).astimezone().date().isoformat()
