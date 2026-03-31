from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from typing import Any


ROOT = Path(__file__).parent
DATA_DIR = ROOT / "data"
SETTINGS_PATH = DATA_DIR / "settings.local.json"
LEGACY_TOKENS_PATH = DATA_DIR / "tokens.local.json"
LEGACY_STATE_PATH = DATA_DIR / "oauth_state.local.json"
SQLITE_DB_PATH = DATA_DIR / "app.local.db"


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


def _database_url() -> str:
    return os.environ.get("DATABASE_URL", "").strip()


def _using_postgres() -> bool:
    return _database_url().startswith(("postgres://", "postgresql://"))


def _sqlite_connection() -> sqlite3.Connection:
    _ensure_data_dir()
    connection = sqlite3.connect(SQLITE_DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def _postgres_connection():
    import psycopg

    return psycopg.connect(_database_url(), autocommit=True)


def _db_connection():
    if _using_postgres():
        return _postgres_connection()
    return _sqlite_connection()


def _json_dumps(payload: Any) -> str:
    return json.dumps(payload)


def _json_loads(payload: str) -> Any:
    return json.loads(payload)


def init_storage() -> None:
    if _using_postgres():
        connection = _postgres_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS app_kv_store (
                        namespace TEXT NOT NULL,
                        key TEXT NOT NULL,
                        value_json TEXT NOT NULL,
                        updated_at BIGINT NOT NULL,
                        PRIMARY KEY (namespace, key)
                    )
                    """
                )
        finally:
            connection.close()
        return

    connection = _sqlite_connection()
    try:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS app_kv_store (
                namespace TEXT NOT NULL,
                key TEXT NOT NULL,
                value_json TEXT NOT NULL,
                updated_at INTEGER NOT NULL,
                PRIMARY KEY (namespace, key)
            )
            """
        )
        connection.commit()
    finally:
        connection.close()


def _set_namespace_values(namespace: str, values: dict[str, Any]) -> None:
    import time

    init_storage()
    connection = _db_connection()
    now = int(time.time())
    try:
        if _using_postgres():
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM app_kv_store WHERE namespace = %s", (namespace,))
                for key, value in values.items():
                    cursor.execute(
                        """
                        INSERT INTO app_kv_store (namespace, key, value_json, updated_at)
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT (namespace, key)
                        DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = EXCLUDED.updated_at
                        """,
                        (namespace, key, _json_dumps(value), now),
                    )
        else:
            connection.execute("DELETE FROM app_kv_store WHERE namespace = ?", (namespace,))
            for key, value in values.items():
                connection.execute(
                    """
                    INSERT OR REPLACE INTO app_kv_store (namespace, key, value_json, updated_at)
                    VALUES (?, ?, ?, ?)
                    """,
                    (namespace, key, _json_dumps(value), now),
                )
            connection.commit()
    finally:
        connection.close()


def _get_namespace_values(namespace: str) -> dict[str, Any]:
    init_storage()
    connection = _db_connection()
    try:
        if _using_postgres():
            with connection.cursor() as cursor:
                cursor.execute("SELECT key, value_json FROM app_kv_store WHERE namespace = %s", (namespace,))
                rows = cursor.fetchall()
        else:
            rows = connection.execute(
                "SELECT key, value_json FROM app_kv_store WHERE namespace = ?",
                (namespace,),
            ).fetchall()
        return {row[0]: _json_loads(row[1]) for row in rows}
    finally:
        connection.close()


def _migrate_legacy_json(namespace: str, path: Path) -> None:
    existing = _get_namespace_values(namespace)
    if existing or not path.exists():
        return

    payload = _load_json(path, {})
    if isinstance(payload, dict) and payload:
        _set_namespace_values(namespace, payload)


def load_settings() -> dict[str, Any]:
    settings = _load_json(
        SETTINGS_PATH,
        {
            "public_base_url": "",
            "allow_insecure_ssl": False,
            "app_user_agent": "AdaptiveRunningCoach/0.1 (+https://adaptive-running-coach-program.onrender.com)",
            "goal_race_date": "",
            "preferred_long_run_day": "Sunday",
            "athlete_name": "",
            "goal_half_marathon_time": "",
            "recent_race_result": "",
            "max_comfortable_long_run_miles": "",
            "desired_runs_per_week": "5",
            "desired_strength_frequency": "2",
            "preferred_adaptation_emphasis": "",
            "injury_flags": "",
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
    settings["preferred_long_run_day"] = os.environ.get(
        "PREFERRED_LONG_RUN_DAY",
        settings.get("preferred_long_run_day", "Sunday"),
    ).strip()
    settings["goal_half_marathon_time"] = os.environ.get(
        "GOAL_HALF_MARATHON_TIME",
        settings.get("goal_half_marathon_time", ""),
    ).strip()
    settings["recent_race_result"] = os.environ.get(
        "RECENT_RACE_RESULT",
        settings.get("recent_race_result", ""),
    ).strip()
    settings["max_comfortable_long_run_miles"] = os.environ.get(
        "MAX_COMFORTABLE_LONG_RUN_MILES",
        str(settings.get("max_comfortable_long_run_miles", "")),
    ).strip()
    settings["desired_runs_per_week"] = os.environ.get(
        "DESIRED_RUNS_PER_WEEK",
        str(settings.get("desired_runs_per_week", "5")),
    ).strip()
    settings["desired_strength_frequency"] = os.environ.get(
        "DESIRED_STRENGTH_FREQUENCY",
        str(settings.get("desired_strength_frequency", "2")),
    ).strip()
    settings["preferred_adaptation_emphasis"] = os.environ.get(
        "PREFERRED_ADAPTATION_EMPHASIS",
        settings.get("preferred_adaptation_emphasis", ""),
    ).strip()
    settings["injury_flags"] = os.environ.get(
        "INJURY_FLAGS",
        settings.get("injury_flags", ""),
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
    _migrate_legacy_json("tokens", LEGACY_TOKENS_PATH)
    return _get_namespace_values("tokens")


def save_tokens(tokens: dict[str, Any]) -> None:
    _set_namespace_values("tokens", tokens)


def load_states() -> dict[str, str]:
    _migrate_legacy_json("oauth_states", LEGACY_STATE_PATH)
    return _get_namespace_values("oauth_states")


def save_states(states: dict[str, str]) -> None:
    _set_namespace_values("oauth_states", states)


def load_weekly_plans() -> dict[str, Any]:
    return _get_namespace_values("weekly_plans")


def save_weekly_plans(plans: dict[str, Any]) -> None:
    _set_namespace_values("weekly_plans", plans)


def load_daily_checkins() -> dict[str, Any]:
    return _get_namespace_values("daily_checkins")


def save_daily_checkins(checkins: dict[str, Any]) -> None:
    _set_namespace_values("daily_checkins", checkins)


def save_daily_checkin(day: str, payload: dict[str, Any]) -> dict[str, Any]:
    checkins = load_daily_checkins()
    key = str(day or "").strip()
    if not key:
        return checkins
    if payload:
        checkins[key] = payload
    else:
        checkins.pop(key, None)
    save_daily_checkins(checkins)
    return checkins


def load_daily_recommendation(day: str) -> dict[str, Any] | None:
    return _get_namespace_values("daily_recommendations").get(str(day or "").strip())


def save_daily_recommendation(day: str, data: dict[str, Any]) -> None:
    key = str(day or "").strip()
    if not key:
        return
    recs = _get_namespace_values("daily_recommendations")
    recs[key] = data
    _set_namespace_values("daily_recommendations", recs)


def clear_daily_recommendation(day: str) -> None:
    key = str(day or "").strip()
    if not key:
        return
    recs = _get_namespace_values("daily_recommendations")
    if key in recs:
        recs.pop(key)
        _set_namespace_values("daily_recommendations", recs)


def load_activity_notes() -> dict[str, Any]:
    return _get_namespace_values("activity_notes")


def save_activity_notes(notes: dict[str, Any]) -> None:
    _set_namespace_values("activity_notes", notes)


def save_activity_note(activity_key: str, note: str) -> dict[str, Any]:
    notes = load_activity_notes()
    key = str(activity_key or "").strip()
    if not key:
        return notes
    text = str(note or "").strip()
    if text:
        notes[key] = {"note": text}
    else:
        notes.pop(key, None)
    save_activity_notes(notes)
    return notes
