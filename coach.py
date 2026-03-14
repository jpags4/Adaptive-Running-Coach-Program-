from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import date, datetime
from statistics import mean


@dataclass
class Run:
    day: str
    distance_miles: float
    duration_minutes: int
    effort: str
    workout_type: str


@dataclass
class RecoveryMetrics:
    day: str
    recovery_score: int
    sleep_hours: float
    resting_hr: int
    hrv_ms: int
    strain: float


@dataclass
class AthleteProfile:
    name: str
    goal_race_date: str
    weekly_mileage_target: int
    preferred_long_run_day: str


@dataclass
class Recommendation:
    date: str
    workout: str
    intensity: str
    duration_minutes: int
    explanation: list[str]
    warnings: list[str]
    confidence: str

    def to_dict(self) -> dict:
        return asdict(self)


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def days_until_race(goal_race_date: str, today: date) -> int:
    return (parse_date(goal_race_date) - today).days


def recent_mileage(runs: list[Run], days: int = 7) -> float:
    if not runs:
        return 0.0

    latest_day = max(parse_date(run.day) for run in runs)
    cutoff = latest_day.toordinal() - days + 1
    return round(
        sum(run.distance_miles for run in runs if parse_date(run.day).toordinal() >= cutoff),
        1,
    )


def acute_load(runs: list[Run], days: int = 3) -> float:
    if not runs:
        return 0.0

    latest_day = max(parse_date(run.day) for run in runs)
    cutoff = latest_day.toordinal() - days + 1
    return round(
        sum(run.duration_minutes for run in runs if parse_date(run.day).toordinal() >= cutoff),
        1,
    )


def average_resting_hr(metrics: list[RecoveryMetrics], days: int = 7) -> float:
    if not metrics:
        return 0.0

    latest_day = max(parse_date(item.day) for item in metrics)
    cutoff = latest_day.toordinal() - days + 1
    values = [item.resting_hr for item in metrics if parse_date(item.day).toordinal() >= cutoff]
    return round(mean(values), 1) if values else 0.0


def coach_recommendation(
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    today: date | None = None,
) -> Recommendation:
    today = today or max(parse_date(item.day) for item in metrics)
    today_str = today.isoformat()
    latest_metrics = next((item for item in metrics if item.day == today_str), None)

    if latest_metrics is None:
        raise ValueError(f"No Whoop-style metrics found for {today_str}")

    seven_day_miles = recent_mileage(runs, days=7)
    three_day_load = acute_load(runs, days=3)
    baseline_rhr = average_resting_hr(metrics, days=7)
    race_countdown = days_until_race(profile.goal_race_date, today)
    latest_run = max(runs, key=lambda item: item.day) if runs else None
    recent_quality_run = any(
        run.effort in {"hard", "very hard"}
        and 0 < (today - parse_date(run.day)).days <= 3
        for run in runs
    )

    explanation: list[str] = []
    warnings: list[str] = []

    if race_countdown <= 14:
        phase = "taper"
    elif race_countdown <= 42:
        phase = "specific"
    else:
        phase = "base"

    recovery_low = latest_metrics.recovery_score < 40
    recovery_ok = 40 <= latest_metrics.recovery_score < 67
    sleep_low = latest_metrics.sleep_hours < 6.5
    strain_high = latest_metrics.strain >= 16
    elevated_rhr = baseline_rhr and latest_metrics.resting_hr >= baseline_rhr + 4
    load_high = three_day_load >= 180
    yesterday_hard = bool(latest_run and latest_run.effort in {"hard", "very hard"} and latest_run.day != today_str)

    if recovery_low or (sleep_low and elevated_rhr):
        workout = "Recovery day"
        intensity = "very easy"
        duration = 30
        explanation.append("Recovery signals are suppressed, so today's priority is absorbing training.")
    elif strain_high and load_high:
        workout = "Easy aerobic run"
        intensity = "easy"
        duration = 40
        explanation.append("Short-term load is already high, so keeping intensity down lowers injury risk.")
    elif phase == "taper":
        workout = "Race-pace primer"
        intensity = "moderate"
        duration = 35
        explanation.append("The race is close, so we preserve sharpness without adding much fatigue.")
    elif yesterday_hard or recent_quality_run or recovery_ok:
        workout = "Easy aerobic run"
        intensity = "easy"
        duration = 45
        explanation.append("Recent work suggests an aerobic support day is better than another quality session.")
    elif phase == "specific":
        workout = "Tempo session"
        intensity = "moderately hard"
        duration = 55
        explanation.append("You're in a race-specific window, so threshold work helps half marathon readiness.")
    else:
        workout = "Steady endurance run"
        intensity = "moderate"
        duration = 50
        explanation.append("Current readiness supports building aerobic volume.")

    if seven_day_miles < profile.weekly_mileage_target * 0.65:
        explanation.append("Weekly mileage is below target, so the engine leans toward maintaining consistency.")
    elif seven_day_miles > profile.weekly_mileage_target * 1.15:
        warnings.append("Recent mileage is above your target range; be cautious about piling on more stress.")

    if sleep_low:
        warnings.append("Sleep dipped below 6.5 hours, which can reduce workout quality and recovery.")
    if elevated_rhr:
        warnings.append("Resting heart rate is elevated relative to your recent baseline.")
    if latest_metrics.recovery_score >= 80:
        explanation.append("Recovery is strong today, which supports quality if the broader load picture agrees.")

    if recovery_low or elevated_rhr:
        confidence = "medium"
    elif latest_metrics.recovery_score >= 67 and not strain_high:
        confidence = "high"
    else:
        confidence = "medium"

    return Recommendation(
        date=today_str,
        workout=workout,
        intensity=intensity,
        duration_minutes=duration,
        explanation=explanation,
        warnings=warnings,
        confidence=confidence,
    )
