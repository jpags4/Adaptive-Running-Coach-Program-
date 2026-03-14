from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any


ROOT = Path(__file__).parent
DATA_DIR = ROOT / "data"
SETTINGS_PATH = DATA_DIR / "settings.local.json"
TOKENS_PATH = DATA_DIR / "tokens.local.json"
STATE_PATH = DATA_DIR / "oauth_state.local.json"


def _ensure_data_dir() -> None:
    DATA_DIR.mkdir(exist_ok=True)


def _load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default

    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _save_json(path: Path, payload: Any) -> None:
    _ensure_data_dir()
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)


def load_settings() -> dict[str, Any]:
    settings = _load_json(
        SETTINGS_PATH,
        {
            "public_base_url": "",
            "allow_insecure_ssl": False,
            "app_user_agent": "AdaptiveRunningCoach/0.1 (+https://adaptive-running-coach-program.onrender.com)",
            "goal_race_date": "",
            "weekly_mileage_target": "28",
            "preferred_long_run_day": "Sunday",
            "athlete_name": "",
            "strava": {"client_id": "", "client_secret": ""},
            "whoop": {"client_id": "", "client_secret": ""},
        },
    )
    env_public_base_url = os.environ.get("APP_BASE_URL", "").strip()
    if env_public_base_url:
        settings["public_base_url"] = env_public_base_url.rstrip("/")

    settings["allow_insecure_ssl"] = os.environ.get("ALLOW_INSECURE_SSL", "").lower() in {"1", "true", "yes"} or bool(
        settings.get("allow_insecure_ssl")
    )
    settings["app_user_agent"] = os.environ.get(
        "APP_USER_AGENT",
        settings.get("app_user_agent", "AdaptiveRunningCoach/0.1"),
    ).strip()

    settings["athlete_name"] = os.environ.get("ATHLETE_NAME", settings.get("athlete_name", "")).strip()
    settings["goal_race_date"] = os.environ.get("GOAL_RACE_DATE", settings.get("goal_race_date", "")).strip()
    settings["weekly_mileage_target"] = os.environ.get(
        "WEEKLY_MILEAGE_TARGET",
        str(settings.get("weekly_mileage_target", "28")),
    ).strip()
    settings["preferred_long_run_day"] = os.environ.get(
        "PREFERRED_LONG_RUN_DAY",
        settings.get("preferred_long_run_day", "Sunday"),
    ).strip()

    settings.setdefault("strava", {})
    settings.setdefault("whoop", {})
    settings["strava"]["client_id"] = os.environ.get("STRAVA_CLIENT_ID", settings["strava"].get("client_id", "")).strip()
    settings["strava"]["client_secret"] = os.environ.get(
        "STRAVA_CLIENT_SECRET",
        settings["strava"].get("client_secret", ""),
    ).strip()
    settings["whoop"]["client_id"] = os.environ.get("WHOOP_CLIENT_ID", settings["whoop"].get("client_id", "")).strip()
    settings["whoop"]["client_secret"] = os.environ.get(
        "WHOOP_CLIENT_SECRET",
        settings["whoop"].get("client_secret", ""),
    ).strip()
    return settings


def using_hosted_env() -> bool:
    hosted_keys = [
        "APP_BASE_URL",
        "STRAVA_CLIENT_ID",
        "STRAVA_CLIENT_SECRET",
        "WHOOP_CLIENT_ID",
        "WHOOP_CLIENT_SECRET",
    ]
    return any(os.environ.get(key) for key in hosted_keys)


def save_settings(settings: dict[str, Any]) -> None:
    _save_json(SETTINGS_PATH, settings)


def load_tokens() -> dict[str, Any]:
    return _load_json(TOKENS_PATH, {})


def save_tokens(tokens: dict[str, Any]) -> None:
    _save_json(TOKENS_PATH, tokens)


def load_states() -> dict[str, str]:
    return _load_json(STATE_PATH, {})


def save_states(states: dict[str, str]) -> None:
    _save_json(STATE_PATH, states)
