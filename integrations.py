from __future__ import annotations

import json
import secrets
import ssl
import time
from dataclasses import asdict
from datetime import UTC, date, datetime
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
        "https://www.strava.com/api/v3/athlete/activities?per_page=10&page=1",
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
            "https://api.prod.whoop.com/developer/v2/recovery?limit=7",
            access_token,
            allow_insecure_ssl=allow_insecure_ssl,
            user_agent=user_agent,
        )
    except HTTPError as exc:
        raise RuntimeError(f"WHOOP recovery request failed with HTTP {exc.code}. Check that read:recovery is enabled in your WHOOP app.") from exc
    try:
        sleeps = _get_json(
            "https://api.prod.whoop.com/developer/v2/activity/sleep?limit=7",
            access_token,
            allow_insecure_ssl=allow_insecure_ssl,
            user_agent=user_agent,
        )
    except HTTPError as exc:
        raise RuntimeError(f"WHOOP sleep request failed with HTTP {exc.code}. Check that read:sleep is enabled in your WHOOP app.") from exc
    try:
        cycles = _get_json(
            "https://api.prod.whoop.com/developer/v2/cycle?limit=7",
            access_token,
            allow_insecure_ssl=allow_insecure_ssl,
            user_agent=user_agent,
        )
    except HTTPError as exc:
        raise RuntimeError(f"WHOOP cycle request failed with HTTP {exc.code}. Check that read:cycles is enabled in your WHOOP app.") from exc
    try:
        workouts = _get_json(
            "https://api.prod.whoop.com/developer/v2/activity/workout?limit=7",
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

    if activity.get("sport_type") == "Run" and activity.get("distance", 0) >= 15000:
        return "moderate"

    return "easy"


def strava_runs_to_model(activities: list[dict]) -> list[Run]:
    runs: list[Run] = []
    for activity in activities:
        if activity.get("type") != "Run" and activity.get("sport_type") != "Run":
            continue

        start = activity.get("start_date_local") or activity.get("start_date")
        if not start:
            continue

        distance_miles = round(float(activity.get("distance", 0)) * 0.000621371, 2)
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
    for activity in activities[:8]:
        distance_miles = round(float(activity.get("distance", 0)) * 0.000621371, 2)
        duration_minutes = max(1, int(activity.get("moving_time", 0) / 60))
        pace = round(duration_minutes / distance_miles, 2) if distance_miles > 0 else 0.0
        previews.append(
            {
                "source": "Strava",
                "name": activity.get("name") or activity.get("sport_type") or activity.get("type") or "Activity",
                "day": (activity.get("start_date_local") or activity.get("start_date") or "")[:10],
                "sport": activity.get("sport_type") or activity.get("type") or "Activity",
                "distance_miles": distance_miles,
                "duration_minutes": duration_minutes,
                "average_pace_min_per_mile": pace,
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
    for workout in snapshot.get("workouts", {}).get("records", [])[:8]:
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
                "day": start[:10],
                "sport": sport_name,
                "distance_miles": 0,
                "duration_minutes": duration_minutes,
                "average_pace_min_per_mile": 0,
                "strain": round(float(strain), 1) if strain is not None else None,
            }
        )
    return previews


def profile_from_settings(settings: dict) -> AthleteProfile:
    goal_race_date = settings.get("goal_race_date") or (date.today().replace(month=5, day=10).isoformat())
    weekly_target = int(settings.get("weekly_mileage_target") or 28)
    return AthleteProfile(
        name=settings.get("athlete_name") or "Runner",
        goal_race_date=goal_race_date,
        weekly_mileage_target=weekly_target,
        preferred_long_run_day=settings.get("preferred_long_run_day") or "Sunday",
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
    return datetime.now(UTC).date().isoformat()
