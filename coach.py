from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import date, datetime, timedelta
import re
from statistics import mean


@dataclass
class Run:
    day: str
    distance_miles: float
    duration_minutes: int
    effort: str
    workout_type: str
    average_pace_min_per_mile: float = 0.0
    source: str = "strava"


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
    goal_half_marathon_time: str = ""
    recent_race_result: str = ""
    max_comfortable_long_run_miles: float = 0.0
    desired_runs_per_week: int = 5
    desired_strength_frequency: int = 2
    preferred_adaptation_emphasis: str = ""
    injury_flags: str = ""


@dataclass
class PaceAnchor:
    label: str
    pace_range: str
    confidence: str
    basis: str


@dataclass
class PaceModel:
    easy: PaceAnchor
    steady: PaceAnchor
    threshold: PaceAnchor
    long_run: PaceAnchor
    race_pace: PaceAnchor

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class WeeklyIntent:
    week_start: str
    phase: str
    week_type: str
    primary_adaptation: str
    mileage_target: float
    mileage_range: str
    long_run_target: str
    quality_session_target: str
    key_session: str
    strength_target: str
    strain_constraints: list[str] = field(default_factory=list)
    non_negotiables: list[str] = field(default_factory=list)
    flex_points: list[str] = field(default_factory=list)
    progression_note: str = ""
    race_connection: str = ""
    pace_model: dict[str, dict] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class DailyAdaptation:
    planned_session: str
    readiness_status: str
    adjustment_reason: str
    adjusted_session: str
    weekly_goal_remains: str
    reschedule_suggestion: str

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class Recommendation:
    date: str
    workout: str
    intensity: str
    duration_minutes: int
    run_distance_miles: float
    run_pace_guidance: str
    lift_focus: str
    lift_guidance: str
    recap: list[str]
    explanation: list[str]
    explanation_sections: dict[str, str]
    warnings: list[str]
    confidence: str
    planned_workout: str = ""
    planned_run_distance_miles: float = 0.0
    planned_pace_guidance: str = ""
    pace_model: dict[str, dict] = field(default_factory=dict)
    weekly_intent: dict = field(default_factory=dict)
    daily_adaptation: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)


def recommendation_from_dict(payload: dict) -> Recommendation:
    return Recommendation(
        date=payload["date"],
        workout=payload["workout"],
        intensity=payload["intensity"],
        duration_minutes=int(payload["duration_minutes"]),
        run_distance_miles=float(payload["run_distance_miles"]),
        run_pace_guidance=payload["run_pace_guidance"],
        lift_focus=payload["lift_focus"],
        lift_guidance=payload["lift_guidance"],
        recap=list(payload.get("recap", [])),
        explanation=list(payload.get("explanation", [])),
        explanation_sections=dict(payload.get("explanation_sections", {})),
        warnings=list(payload.get("warnings", [])),
        confidence=payload.get("confidence", "medium"),
        planned_workout=payload.get("planned_workout", ""),
        planned_run_distance_miles=float(payload.get("planned_run_distance_miles", 0.0)),
        planned_pace_guidance=payload.get("planned_pace_guidance", ""),
        pace_model=dict(payload.get("pace_model", {})),
        weekly_intent=dict(payload.get("weekly_intent", {})),
        daily_adaptation=dict(payload.get("daily_adaptation", {})),
    )


def _intensity_rank(value: str) -> int:
    text = str(value or "").strip().lower()
    if text in {"rest", "off"}:
        return 0
    if text in {"very easy", "recovery"}:
        return 1
    if text == "easy":
        return 2
    if text in {"moderate", "steady"}:
        return 3
    if text in {"hard", "tempo", "threshold", "interval", "very hard"}:
        return 4
    return 2


def _workout_text_rank(value: str) -> int:
    text = str(value or "").strip().lower()
    if any(token in text for token in {"rest", "mobility", "walk"}):
        return 0
    if any(token in text for token in {"very easy", "recovery"}):
        return 1
    if any(token in text for token in {"easy", "aerobic"}):
        return 2
    if any(token in text for token in {"steady", "moderate", "progression"}):
        return 3
    if any(token in text for token in {"threshold", "tempo", "interval", "race", "hard"}):
        return 4
    return 2


def _lift_load_rank(value: str) -> int:
    text = str(value or "").strip().lower()
    if any(token in text for token in {"no lifting", "off-day"}):
        return 0
    if any(token in text for token in {"mobility", "tissue care", "light durability"}):
        return 1
    return 2


def _recommendation_load_score(recommendation: Recommendation) -> float:
    run_rank = max(_intensity_rank(recommendation.intensity), _workout_text_rank(recommendation.workout))
    return run_rank * 100 + recommendation.run_distance_miles * 10 + _lift_load_rank(recommendation.lift_focus)


def _planned_session_load_score(workout: str, distance_miles: float) -> float:
    return _workout_text_rank(workout) * 100 + max(0.0, float(distance_miles or 0.0)) * 10


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


def previous_run(runs: list[Run], today: date) -> Run | None:
    previous_runs = [run for run in runs if parse_date(run.day) < today]
    return max(previous_runs, key=lambda item: item.day) if previous_runs else None


def average_easy_pace(runs: list[Run], days: int = 28) -> float:
    if not runs:
        return 10.0

    latest_day = max(parse_date(run.day) for run in runs)
    cutoff = latest_day.toordinal() - days + 1
    eligible = [
        run.average_pace_min_per_mile
        for run in runs
        if run.average_pace_min_per_mile > 0
        and run.effort == "easy"
        and parse_date(run.day).toordinal() >= cutoff
    ]
    if eligible:
        return round(mean(eligible[-6:]), 2)

    all_paces = [
        run.average_pace_min_per_mile
        for run in runs
        if run.average_pace_min_per_mile > 0 and parse_date(run.day).toordinal() >= cutoff
    ]
    return round(mean(all_paces[-6:]), 2) if all_paces else 10.0


def _format_pace_value(value: float) -> str:
    total_seconds = max(270, int(round(value * 60)))
    minutes = total_seconds // 60
    seconds = total_seconds % 60
    return f"{minutes}:{seconds:02d}"


def pace_window(base_pace: float, faster: float = 0.0, slower: float = 0.0) -> str:
    low = max(4.5, base_pace - faster)
    high = max(low, base_pace + slower)
    return f"{_format_pace_value(low)}-{_format_pace_value(high)}/mi"


def _effort_paces(runs: list[Run], *, efforts: set[str] | None = None, workout_types: set[str] | None = None, days: int = 42) -> list[float]:
    if not runs:
        return []

    latest_day = max(parse_date(run.day) for run in runs)
    cutoff = latest_day.toordinal() - days + 1
    values: list[float] = []
    for run in sorted(runs, key=lambda item: item.day):
        if run.average_pace_min_per_mile <= 0 or parse_date(run.day).toordinal() < cutoff:
            continue
        if efforts and run.effort not in efforts:
            continue
        if workout_types and run.workout_type not in workout_types:
            continue
        values.append(run.average_pace_min_per_mile)
    return values


def _pace_confidence(sample_count: int) -> str:
    if sample_count >= 3:
        return "high"
    if sample_count >= 1:
        return "medium"
    return "low"


def _pace_anchor(label: str, base_pace: float, faster: float, slower: float, sample_count: int, basis: str) -> PaceAnchor:
    return PaceAnchor(
        label=label,
        pace_range=pace_window(base_pace, faster=faster, slower=slower),
        confidence=_pace_confidence(sample_count),
        basis=basis,
    )


def _goal_race_pace(profile: AthleteProfile) -> float | None:
    value = str(profile.goal_half_marathon_time or "").strip().lower()
    if not value:
        return None

    match = None
    if ":" in value:
        parts = [int(part) for part in value.split(":") if part.isdigit()]
        if len(parts) == 2:
            hours = 0
            minutes, seconds = parts
        elif len(parts) == 3:
            hours, minutes, seconds = parts
        else:
            return None
        total_minutes = hours * 60 + minutes + seconds / 60
        match = total_minutes
    else:
        digits = "".join(char for char in value if char.isdigit())
        if digits:
            match = float(digits)

    if not match or match <= 0:
        return None
    return round(match / 13.1094, 2)


def _parse_time_to_minutes(value: str) -> float | None:
    text = str(value or "").strip().lower()
    if not text:
        return None

    timed_match = re.search(r"(\d+(?::\d{1,2}){1,2})", text)
    if timed_match:
        parts = [int(part) for part in timed_match.group(1).split(":")]
        if len(parts) == 2:
            minutes, seconds = parts
            return minutes + seconds / 60
        if len(parts) == 3:
            hours, minutes, seconds = parts
            return hours * 60 + minutes + seconds / 60
        return None

    digits = "".join(char for char in text if char.isdigit() or char == ".")
    return float(digits) if digits else None


def _recent_benchmark_race_pace(profile: AthleteProfile) -> tuple[float | None, str | None]:
    text = str(profile.recent_race_result or "").strip().lower()
    if not text:
        return None, None

    time_minutes = _parse_time_to_minutes(text)
    if not time_minutes:
        return None, None

    race_distance_miles = None
    race_label = None
    if "5k" in text:
        race_distance_miles = 3.1069
        race_label = "Recent 5K benchmark"
    elif "10k" in text:
        race_distance_miles = 6.2137
        race_label = "Recent 10K benchmark"
    elif "half" in text or "hm" in text:
        race_distance_miles = 13.1094
        race_label = "Recent half-marathon benchmark"
    elif "marathon" in text:
        race_distance_miles = 26.2188
        race_label = "Recent marathon benchmark"

    if not race_distance_miles or race_distance_miles <= 0:
        return None, None

    equivalent_half_minutes = time_minutes * ((13.1094 / race_distance_miles) ** 1.06)
    return round(equivalent_half_minutes / 13.1094, 2), race_label


def build_pace_model(profile: AthleteProfile, runs: list[Run]) -> PaceModel:
    easy_paces = _effort_paces(runs, efforts={"easy"})
    steady_paces = _effort_paces(runs, efforts={"moderate"}, workout_types={"steady", "progression", "long_run"})
    threshold_paces = _effort_paces(runs, efforts={"hard", "very hard"}, workout_types={"tempo", "threshold", "interval", "race"})
    long_run_paces = _effort_paces(runs, workout_types={"long_run"})

    easy_base = round(mean(easy_paces[-6:]), 2) if easy_paces else average_easy_pace(runs)
    steady_base = round(mean(steady_paces[-4:]), 2) if steady_paces else round(max(5.0, easy_base - 0.35), 2)
    threshold_base = round(mean(threshold_paces[-4:]), 2) if threshold_paces else round(max(4.8, easy_base - 0.75), 2)
    long_run_base = round(mean(long_run_paces[-4:]), 2) if long_run_paces else round(easy_base + 0.15, 2)
    goal_race_pace = _goal_race_pace(profile)
    benchmark_race_pace, benchmark_basis = _recent_benchmark_race_pace(profile)

    race_pace_candidates = [pace for pace in (goal_race_pace, benchmark_race_pace) if pace]
    if race_pace_candidates:
        race_pace_base = round(mean(race_pace_candidates), 2)
    else:
        race_pace_base = round(max(4.8, threshold_base + 0.12), 2)

    if not threshold_paces and race_pace_candidates:
        threshold_base = round(max(4.8, race_pace_base - 0.1), 2)
    if not steady_paces and race_pace_candidates:
        steady_base = round(max(5.0, race_pace_base + 0.18), 2)
    if not long_run_paces and race_pace_candidates:
        long_run_base = round(max(steady_base + 0.22, easy_base), 2)

    race_basis = "Derived from threshold pace"
    race_sample_count = len(threshold_paces)
    if goal_race_pace and benchmark_race_pace:
        race_basis = "Goal race pace blended with recent benchmark"
        race_sample_count += 2
    elif benchmark_race_pace:
        race_basis = benchmark_basis or "Recent benchmark"
        race_sample_count += 1
    elif goal_race_pace:
        race_basis = "Goal race pace"
        race_sample_count += 1

    return PaceModel(
        easy=_pace_anchor("easy", easy_base, faster=0.0, slower=0.35, sample_count=len(easy_paces), basis="Recent easy runs" if easy_paces else "Fallback from recent average running pace"),
        steady=_pace_anchor("steady", steady_base, faster=0.08, slower=0.15, sample_count=len(steady_paces), basis="Moderate and steady runs" if steady_paces else "Derived from easy pace"),
        threshold=_pace_anchor("threshold", threshold_base, faster=0.08, slower=0.12, sample_count=len(threshold_paces), basis="Tempo, threshold, and hard sessions" if threshold_paces else "Derived from easy pace"),
        long_run=_pace_anchor("long_run", long_run_base, faster=0.0, slower=0.25, sample_count=len(long_run_paces), basis="Recent long runs" if long_run_paces else "Derived from easy pace"),
        race_pace=_pace_anchor("race_pace", race_pace_base, faster=0.05, slower=0.08, sample_count=race_sample_count, basis=race_basis),
    )


def _latest_metric_on_or_before(metrics: list[RecoveryMetrics], today: date) -> RecoveryMetrics | None:
    eligible = [item for item in metrics if parse_date(item.day) <= today]
    return max(eligible, key=lambda item: item.day) if eligible else None


def recent_longest_run(runs: list[Run], days: int = 28) -> float:
    if not runs:
        return 0.0

    latest_day = max(parse_date(run.day) for run in runs)
    cutoff = latest_day.toordinal() - days + 1
    eligible = [run.distance_miles for run in runs if parse_date(run.day).toordinal() >= cutoff]
    return round(max(eligible), 1) if eligible else 0.0


def adaptive_weekly_reference(profile: AthleteProfile, runs: list[Run]) -> float:
    seven_day_miles = recent_mileage(runs, days=7)
    longest_recent_run = recent_longest_run(runs, days=28)
    desired_runs = max(3, int(profile.desired_runs_per_week or 5))

    if seven_day_miles > 0:
        return round(max(16.0, seven_day_miles), 1)

    if longest_recent_run > 0:
        return round(max(16.0, longest_recent_run * max(2.8, min(4.2, desired_runs * 0.72))), 1)

    if profile.max_comfortable_long_run_miles:
        return round(max(16.0, float(profile.max_comfortable_long_run_miles) * 3.2), 1)

    return round(max(16.0, desired_runs * 5.0), 1)


def _training_phase(days_to_race: int, week_type: str) -> str:
    if days_to_race <= 14:
        return "Race taper"
    if week_type == "absorb":
        return "Recovery / absorb"
    if days_to_race <= 35:
        return "Race-specific stamina"
    if days_to_race <= 70:
        return "Threshold build"
    return "Volume build"


def _primary_adaptation(phase: str, preferred: str, week_type: str) -> str:
    preferred_text = str(preferred or "").strip().lower()
    if preferred_text in {"volume", "threshold", "race-specific stamina", "recovery / absorb"}:
        if preferred_text == "recovery / absorb":
            return "recovery / absorb"
        if week_type != "absorb":
            return preferred_text
    if phase == "Race taper":
        return "recovery / absorb"
    if phase == "Race-specific stamina":
        return "race-specific stamina"
    if phase == "Threshold build":
        return "threshold"
    if phase == "Recovery / absorb":
        return "recovery / absorb"
    return "volume"


def _quality_session_target(primary_adaptation: str, pace_model: PaceModel) -> tuple[str, str]:
    if primary_adaptation == "threshold":
        return (
            "20-30 min of controlled threshold work",
            f"Threshold session around {pace_model.threshold.pace_range}",
        )
    if primary_adaptation == "race-specific stamina":
        return (
            "HM-specific stamina with sustained work near race pace",
            f"Race-pace session around {pace_model.race_pace.pace_range}",
        )
    if primary_adaptation == "recovery / absorb":
        return (
            "Only strides or short pickups if recovery stays good",
            f"Mostly easy running around {pace_model.easy.pace_range}",
        )
    return (
        "Steady aerobic support with short threshold touches",
        f"Steady running around {pace_model.steady.pace_range}",
    )


def _weekly_goal_phrase(weekly_intent: WeeklyIntent) -> str:
    if weekly_intent.primary_adaptation == "threshold":
        return "Maintain one controlled threshold stimulus this week."
    if weekly_intent.primary_adaptation == "race-specific stamina":
        return "Protect one race-specific stamina session plus the controlled long run."
    if weekly_intent.primary_adaptation == "recovery / absorb":
        return "Keep the week absorb-focused so fatigue comes down."
    return "Keep the week centered on durable aerobic volume."


def _reschedule_guidance(weekly_intent: WeeklyIntent, readiness_status: str) -> str:
    if readiness_status == "supported":
        return "No reschedule needed if the session feels normal during warm-up."
    if weekly_intent.primary_adaptation in {"threshold", "race-specific stamina"}:
        return "Move the key quality session to the next green-recovery day later this week."
    if weekly_intent.primary_adaptation == "recovery / absorb":
        return "Let the week stay absorb-focused instead of chasing missed work tomorrow."
    return "Let the week absorb the change rather than forcing the missed load tomorrow."


def build_weekly_intent(
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    today: date | None = None,
) -> WeeklyIntent:
    today = today or (max(parse_date(item.day) for item in metrics) if metrics else date.today())
    latest_metric = _latest_metric_on_or_before(metrics, today)
    latest_data_day = max(
        [parse_date(item.day) for item in metrics] + [parse_date(run.day) for run in runs],
        default=today,
    )
    week_start = today - timedelta(days=today.weekday())
    freshest_week_start = latest_data_day - timedelta(days=latest_data_day.weekday())
    future_weeks = max(0, (week_start - freshest_week_start).days // 7)
    seven_day_miles = recent_mileage(runs, days=7)
    longest_recent_run = recent_longest_run(runs, days=28)
    adaptive_target = adaptive_weekly_reference(profile, runs)
    pace_model = build_pace_model(profile, runs)
    days_to_race = days_until_race(profile.goal_race_date, today)

    stale_metrics = bool(latest_metric and (today - parse_date(latest_metric.day)).days > 3)
    low_recovery = bool(
        latest_metric
        and not stale_metrics
        and (latest_metric.recovery_score < 50 or latest_metric.sleep_hours < 6.2 or latest_metric.strain >= 15)
    )
    build_trigger = seven_day_miles >= max(8.0, adaptive_target * 0.8)
    if days_to_race <= 14:
        week_type = "taper"
    elif low_recovery:
        week_type = "absorb"
    elif future_weeks > 0 and future_weeks % 4 == 0:
        week_type = "absorb"
    elif build_trigger:
        week_type = "build"
    else:
        week_type = "steady"

    phase = _training_phase(days_to_race, week_type)
    primary_adaptation = _primary_adaptation(phase, profile.preferred_adaptation_emphasis, week_type)

    if week_type == "taper":
        mileage_target = round(max(12.0, min(adaptive_target * 0.72, seven_day_miles * 0.85 or adaptive_target * 0.72)), 1)
    elif week_type == "absorb":
        mileage_target = round(max(14.0, min(adaptive_target * 0.9, max(seven_day_miles * 0.9, adaptive_target * 0.75))), 1)
    elif week_type == "build":
        mileage_target = round(max(adaptive_target * 0.94, seven_day_miles * 1.05 or adaptive_target * 0.94), 1)
    else:
        mileage_target = round(max(seven_day_miles, adaptive_target * 0.88), 1)

    long_run_cap = profile.max_comfortable_long_run_miles or max(8.0, mileage_target * 0.35)
    if profile.max_comfortable_long_run_miles and long_run_cap < mileage_target * 0.32:
        mileage_target = round(min(mileage_target, max(16.0, long_run_cap * 3.25)), 1)

    if week_type == "taper":
        long_run_target_miles = max(6.0, min(long_run_cap, longest_recent_run * 0.8 if longest_recent_run else 8.0))
    elif week_type == "absorb":
        long_run_target_miles = max(7.0, min(long_run_cap, longest_recent_run or mileage_target * 0.3))
    else:
        long_run_target_miles = max(8.0, min(long_run_cap, max(longest_recent_run, mileage_target * 0.33)))

    quality_session_target, key_session = _quality_session_target(primary_adaptation, pace_model)
    lower_bound = max(10.0, mileage_target - 1.5)
    upper_bound = mileage_target + 1.5
    progression_note = (
        "This is an easier absorb week so fatigue can come down before the next build."
        if week_type == "absorb"
        else "This week builds slightly on recent load without forcing a big mileage jump."
        if week_type == "build"
        else "This week keeps volume steady so the key session quality stays high."
    )
    if week_type == "taper":
        progression_note = "This week cuts load so you arrive fresher while keeping some rhythm."

    race_connection = (
        "The week protects freshness for race day."
        if days_to_race <= 14
        else "The week supports half-marathon durability by pairing one key quality stimulus with a controlled long run."
    )

    strain_constraints = [
        "Downshift if sleep drops below 6 hours or recovery falls below 45%.",
        "Avoid stacking two demanding leg days inside 72 hours.",
    ]
    if latest_metric and latest_metric.strain >= 13:
        strain_constraints.append("Keep non-running stress low because recent strain is already elevated.")

    non_negotiables = [
        "Keep the long run on the preferred day unless recovery forces a swap.",
        "Preserve one key session that matches the week's primary adaptation.",
    ]
    if primary_adaptation == "recovery / absorb":
        non_negotiables[1] = "Keep the week absorb-focused and do not force a hard session."

    flex_points = [
        "Easy mileage can shorten by 15-25% if legs feel heavy.",
        "Strength can move around the easy days, but avoid heavy lower body after quality work.",
    ]
    if primary_adaptation in {"threshold", "race-specific stamina"}:
        flex_points.append("If readiness is poor, move the quality day later in the week instead of forcing it today.")

    return WeeklyIntent(
        week_start=week_start.isoformat(),
        phase=phase,
        week_type=week_type,
        primary_adaptation=primary_adaptation,
        mileage_target=mileage_target,
        mileage_range=f"{lower_bound:.0f}-{upper_bound:.0f} miles",
        long_run_target=f"{long_run_target_miles:.0f} miles around {pace_model.long_run.pace_range}",
        quality_session_target=quality_session_target,
        key_session=key_session,
        strength_target=f"{max(1, profile.desired_strength_frequency)} sessions, keep lower-body work secondary to key run days",
        strain_constraints=strain_constraints,
        non_negotiables=non_negotiables,
        flex_points=flex_points,
        progression_note=progression_note,
        race_connection=race_connection,
        pace_model=pace_model.to_dict(),
    )


def planned_session_for_day(weekly_intent: WeeklyIntent, profile: AthleteProfile, today: date) -> dict[str, str | float]:
    long_run_day = str(profile.preferred_long_run_day or "Sunday").strip().lower()
    weekday_names = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ]
    long_run_index = weekday_names.index(long_run_day) if long_run_day in weekday_names else 6
    quality_day = (long_run_index - 5) % 7
    steady_day = (long_run_index - 3) % 7
    easy_day = (quality_day - 1) % 7
    aerobic_day = (steady_day + 1) % 7

    pace_model = weekly_intent.pace_model
    easy_pace = pace_model.get("easy", {}).get("pace_range", "9:15-9:45/mi")
    steady_pace = pace_model.get("steady", {}).get("pace_range", easy_pace)
    threshold_pace = pace_model.get("threshold", {}).get("pace_range", steady_pace)
    race_pace = pace_model.get("race_pace", {}).get("pace_range", threshold_pace)
    long_pace = pace_model.get("long_run", {}).get("pace_range", easy_pace)

    long_run_miles = float(str(weekly_intent.long_run_target).split(" ", 1)[0])
    base_easy_miles = round(max(3.0, weekly_intent.mileage_target * 0.15), 1)
    base_steady_miles = round(max(4.0, weekly_intent.mileage_target * 0.19), 1)
    quality_miles = round(max(4.5, weekly_intent.mileage_target * 0.2), 1)

    plan_map = {
        easy_day: {
            "workout": "Easy run + strides",
            "intensity": "easy",
            "distance_miles": base_easy_miles,
            "pace_guidance": easy_pace,
        },
        quality_day: {
            "workout": "Threshold intervals" if weekly_intent.primary_adaptation == "threshold" else "Race-specific stamina session" if weekly_intent.primary_adaptation == "race-specific stamina" else "Controlled aerobic support session",
            "intensity": "hard" if weekly_intent.primary_adaptation in {"threshold", "race-specific stamina"} else "moderate",
            "distance_miles": quality_miles,
            "pace_guidance": threshold_pace if weekly_intent.primary_adaptation == "threshold" else race_pace if weekly_intent.primary_adaptation == "race-specific stamina" else steady_pace,
        },
        steady_day: {
            "workout": "Steady aerobic run",
            "intensity": "moderate",
            "distance_miles": base_steady_miles,
            "pace_guidance": steady_pace,
        },
        aerobic_day: {
            "workout": "Easy aerobic run",
            "intensity": "easy",
            "distance_miles": base_easy_miles,
            "pace_guidance": easy_pace,
        },
        long_run_index: {
            "workout": "Long run",
            "intensity": "moderate",
            "distance_miles": long_run_miles,
            "pace_guidance": long_pace,
        },
    }

    if weekly_intent.primary_adaptation == "recovery / absorb":
        quality_plan = plan_map[quality_day]
        quality_plan["workout"] = "Easy aerobic run"
        quality_plan["intensity"] = "easy"
        quality_plan["pace_guidance"] = easy_pace

    return plan_map.get(
        today.weekday(),
        {
            "workout": "Rest or optional mobility",
            "intensity": "rest",
            "distance_miles": 0.0,
            "pace_guidance": "Rest day",
        },
    )


def _copy_pace_range(pace_range: dict | None) -> dict | None:
    if not pace_range:
        return None
    return {"min": str(pace_range.get("min") or ""), "max": str(pace_range.get("max") or "")}


def _parse_pace_text_range(text: str) -> dict | None:
    match = re.search(r"(\d+:\d{2})-(\d+:\d{2})/mi", str(text or "").strip())
    if not match:
        return None
    return {"min": match.group(1), "max": match.group(2)}


def _seconds_from_pace_text(value: str) -> int | None:
    match = re.match(r"^(\d+):(\d{2})$", str(value or "").strip())
    if not match:
        return None
    return int(match.group(1)) * 60 + int(match.group(2))


def _pace_text_from_seconds(seconds: int) -> str:
    minutes = seconds // 60
    remainder = seconds % 60
    return f"{minutes}:{remainder:02d}"


def _pace_range_to_text(pace_range: dict | None, intensity: str, should_run: bool) -> str:
    if not should_run:
        return "Rest day"
    if not pace_range or not pace_range.get("min") or not pace_range.get("max"):
        return "By feel / recovery effort"
    return f"{pace_range['min']}-{pace_range['max']}/mi"


def _planned_workout_type(planned: dict[str, str | float]) -> str:
    workout = str(planned.get("workout") or "").strip().lower()
    intensity = str(planned.get("intensity") or "").strip().lower()
    if "rest" in workout:
        return "rest"
    if "long run" in workout:
        return "long_run"
    if "threshold" in workout or "tempo" in workout:
        return "tempo"
    if "interval" in workout:
        return "intervals"
    if "race" in workout:
        return "race_pace"
    if "cross" in workout:
        return "cross_train"
    if "strength" in workout and float(planned.get("distance_miles") or 0.0) <= 0:
        return "strength_only"
    if intensity == "rest":
        return "rest"
    return "easy_run"


def _build_planned_workout_payload(weekly_intent: WeeklyIntent, profile: AthleteProfile, today: date) -> dict:
    planned = planned_session_for_day(weekly_intent, profile, today)
    workout_type = _planned_workout_type(planned)
    pace_range = _parse_pace_text_range(str(planned.get("pace_guidance") or ""))
    easy_pace_range = _parse_pace_text_range(str(weekly_intent.pace_model.get("easy", {}).get("pace_range") or ""))
    return {
        "type": workout_type,
        "plannedMiles": float(planned.get("distance_miles") or 0.0) or None,
        "plannedDurationMin": int(round(float(planned.get("distance_miles") or 0.0) * 10.2)) if float(planned.get("distance_miles") or 0.0) > 0 else None,
        "plannedPaceMinPerMile": None,
        "paceRange": pace_range,
        "easyPaceRange": easy_pace_range,
        "label": str(planned.get("workout") or ""),
        "isKeySession": workout_type in {"tempo", "intervals", "race_pace"},
        "plannedTextPace": str(planned.get("pace_guidance") or ""),
    }


def get_recovery_contribution(recovery_score: int | None) -> tuple[int, str]:
    if recovery_score is None:
        return 0, "Recovery score is unavailable."
    if recovery_score >= 80:
        return 18, "Recovery score is strong."
    if recovery_score >= 67:
        return 12, "Recovery score is moderate."
    if recovery_score >= 50:
        return 4, "Recovery score is moderate."
    if recovery_score >= 35:
        return -10, "Recovery score is below the downshift threshold."
    return -18, "Recovery score is very low."


def get_sleep_contribution(sleep_hours: float | None) -> tuple[int, str]:
    if sleep_hours is None:
        return 0, "Sleep duration is unavailable."
    if sleep_hours >= 8.0:
        return 10, "Sleep duration supports training."
    if sleep_hours >= 7.0:
        return 6, "Sleep duration supports training."
    if sleep_hours >= 6.0:
        return 0, "Sleep was adequate but not optimal."
    if sleep_hours >= 5.0:
        return -8, "Sleep was limited."
    return -14, "Sleep was very low."


def get_resting_hr_contribution(resting_hr: int | None, baseline_resting_hr: float | None) -> tuple[int, str, bool]:
    if resting_hr is None or baseline_resting_hr is None:
        return 0, "Resting heart rate baseline is unavailable.", False
    delta = resting_hr - baseline_resting_hr
    if delta <= 1:
        return 4, "Resting heart rate is near baseline.", False
    if delta <= 3:
        return 0, "Resting heart rate is slightly elevated.", False
    if delta <= 5:
        return -6, "Resting heart rate is meaningfully elevated.", True
    return -12, "Resting heart rate is meaningfully elevated.", True


def get_strain_contribution(yesterday_strain: float | None) -> tuple[int, str, bool]:
    if yesterday_strain is None:
        return 0, "Yesterday's strain is unavailable.", False
    if yesterday_strain < 8:
        return 4, "Recent strain was light.", False
    if yesterday_strain < 12:
        return 0, "Recent strain was manageable.", False
    if yesterday_strain < 16:
        return -6, "Yesterday's load was elevated.", True
    return -12, "Yesterday's load was very high.", True


def get_legs_contribution(legs_feel: str) -> tuple[int, str]:
    text = str(legs_feel or "").strip().lower()
    if text == "fresh":
        return 10, "Legs feel fresh."
    if text == "normal":
        return 3, "Legs feel normal."
    if text == "heavy":
        return -8, "Legs feel heavy."
    if text == "sore":
        return -14, "Legs are sore."
    if text == "injured":
        return -35, "Leg check-in indicates possible injury."
    return 0, "Leg check-in was unavailable."


def get_mental_contribution(mental_state: str) -> tuple[int, str, bool]:
    text = str(mental_state or "").strip().lower()
    if text == "sharp":
        return 6, "Mental state supports training.", False
    if text == "steady":
        return 2, "Mental state is steady.", False
    if text == "stressed":
        return -6, "Stress may reduce training quality.", True
    if text == "drained":
        return -12, "Mental fatigue is high.", True
    return 0, "Mental state is unavailable.", False


def get_notes_contribution(notes: str | None) -> tuple[int, str, bool]:
    normalized = str(notes or "").strip().lower()
    if not normalized:
        return 0, "", False
    override_terms = [
        "sharp pain",
        "limping",
        "can't walk",
        "cannot walk",
        "injury",
        "injured",
        "swollen",
        "swelling",
        "numb",
        "tingling",
        "dizzy",
        "chest pain",
    ]
    negative_terms = ["tight", "tightness", "ache", "aching", "pain", "sore", "fatigue", "tired", "heavy"]
    positive_terms = ["felt good", "good energy", "springy", "fresh"]
    if any(term in normalized for term in override_terms):
        return -30, "Notes include an injury or acute symptom warning.", True
    if any(term in normalized for term in negative_terms):
        return -8, "Notes mention soreness, pain, or fatigue.", False
    if any(term in normalized for term in positive_terms):
        return 4, "Notes describe good energy or freshness.", False
    return 0, "Notes did not add a readiness signal.", False


def calculate_readiness_result(
    metrics: RecoveryMetrics,
    baseline_resting_hr: float | None,
    subjective_feedback: dict | None,
) -> dict:
    feedback = subjective_feedback or {}
    recovery_score, recovery_reason = get_recovery_contribution(metrics.recovery_score)
    sleep_score, sleep_reason = get_sleep_contribution(metrics.sleep_hours)
    resting_hr_score, resting_hr_reason, elevated_hr_caution = get_resting_hr_contribution(metrics.resting_hr, baseline_resting_hr)
    strain_score, strain_reason, high_strain_caution = get_strain_contribution(metrics.strain)
    legs_score, legs_reason = get_legs_contribution(str(feedback.get("physical_feeling") or ""))
    mental_score, mental_reason, mental_downshift = get_mental_contribution(str(feedback.get("mental_feeling") or ""))
    notes_score, notes_reason, notes_override = get_notes_contribution(str(feedback.get("notes") or ""))

    flags = {
        "reduceIntensity": False,
        "reduceVolume": False,
        "avoidSpeedWork": False,
        "avoidHeavyLifting": False,
        "forceRestOrCrossTrain": False,
        "injuryOverride": False,
        "mentalDownshift": mental_downshift,
        "highStrainCaution": high_strain_caution,
        "elevatedHrCaution": elevated_hr_caution,
    }
    reasons = [reason for reason in [recovery_reason, sleep_reason, resting_hr_reason, strain_reason, legs_reason, mental_reason, notes_reason] if reason]
    score = 50 + recovery_score + sleep_score + resting_hr_score + strain_score + legs_score + mental_score + notes_score

    legs_feel = str(feedback.get("physical_feeling") or "").strip().lower()
    mental_state = str(feedback.get("mental_feeling") or "").strip().lower()
    if metrics.recovery_score < 50 and metrics.strain >= 12:
        score -= 8
        flags["reduceIntensity"] = True
        flags["avoidSpeedWork"] = True
        if legs_feel in {"heavy", "sore"}:
            flags["reduceVolume"] = True
        reasons.append("Low recovery combined with elevated recent strain increases caution.")
    if legs_feel in {"heavy", "sore"} and mental_state == "drained":
        score -= 6
        flags["reduceIntensity"] = True
        flags["reduceVolume"] = True
        reasons.append("Heavy or sore legs combined with mental fatigue call for a stronger downshift.")
    if metrics.sleep_hours < 5.5 and metrics.recovery_score < 50:
        score -= 6
        flags["reduceIntensity"] = True
        flags["avoidHeavyLifting"] = True
        reasons.append("Very low sleep combined with low recovery reduces training capacity.")

    injury_triggered = legs_feel == "injured" or notes_override
    score = max(0, min(100, score))
    if injury_triggered:
        flags["forceRestOrCrossTrain"] = True
        flags["reduceIntensity"] = True
        flags["reduceVolume"] = True
        flags["avoidSpeedWork"] = True
        flags["avoidHeavyLifting"] = True
        flags["injuryOverride"] = True
        reasons.append("Injury-related input overrides favorable readiness signals.")
        score = min(score, 20)

    tier = "high" if score >= 70 else "moderate" if score >= 45 else "low"
    if tier == "low":
        flags["reduceIntensity"] = True
        flags["avoidSpeedWork"] = True
        flags["avoidHeavyLifting"] = True
    if score < 40:
        flags["reduceVolume"] = True
    if legs_feel == "sore":
        flags["avoidSpeedWork"] = True
    if metrics.strain >= 16:
        flags["avoidHeavyLifting"] = True
    if mental_state == "drained":
        flags["reduceIntensity"] = True
    if flags["injuryOverride"]:
        tier = "low"

    decision = "push" if tier == "high" else "maintain" if tier == "moderate" else "pull_back"
    if flags["injuryOverride"]:
        decision = "pull_back"
    elif flags["reduceIntensity"] and tier == "high":
        decision = "maintain"
    elif flags["reduceVolume"] and tier == "moderate":
        decision = "pull_back"

    return {
        "score": score,
        "tier": tier,
        "decision": decision,
        "flags": flags,
        "reasons": reasons,
        "componentScores": {
            "recovery": recovery_score,
            "sleep": sleep_score,
            "restingHr": resting_hr_score,
            "strain": strain_score,
            "legs": legs_score,
            "mental": mental_score,
            "notes": notes_score,
        },
    }


def _map_lift_label(action: str) -> str:
    return {
        "lift_as_planned": "Strength as planned",
        "lift_light": "Light strength",
        "core_only": "Core only",
        "mobility_only": "Mobility only",
        "no_lift": "No lifting",
    }.get(action, "No lifting")


def _build_deterministic_context(
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    today: date,
    subjective_feedback: dict | None,
    weekly_intent: WeeklyIntent,
) -> dict:
    feedback = subjective_feedback or {}
    strength_completed = int(feedback.get("weekly_strength_sessions_completed") or 0)
    return {
        "weeklyMilesCompleted": recent_mileage(runs, days=7),
        "weeklyMilesTarget": weekly_intent.mileage_target,
        "daysSinceLastRest": None,
        "completedHardSessionsThisWeek": sum(1 for run in runs if parse_date(run.day) >= today - timedelta(days=today.weekday()) and run.effort in {"hard", "very hard"}),
        "completedStrengthSessionsThisWeek": strength_completed,
        "targetStrengthSessionsPerWeek": profile.desired_strength_frequency,
        "nextKeyWorkoutInDays": 1 if today.weekday() in {0, 1, 2, 3} else None,
        "hasRaceWithinDays": days_until_race(profile.goal_race_date, today) if profile.goal_race_date else None,
    }


def _adjust_volume(base: float | None, percent: int) -> float | None:
    if base is None:
        return None
    return round(base * (1 + percent / 100.0), 1)


def _adjusted_pace_range(planned_workout: dict, target_intensity: str) -> dict | None:
    if target_intensity == "rest":
        return None
    if target_intensity in {"easy", "very_easy"} and planned_workout.get("easyPaceRange"):
        return _copy_pace_range(planned_workout.get("easyPaceRange"))
    current = planned_workout.get("paceRange")
    if not current:
        return None
    if target_intensity in {"hard", "moderate"}:
        return _copy_pace_range(current)
    low_seconds = _seconds_from_pace_text(str(current.get("min") or ""))
    high_seconds = _seconds_from_pace_text(str(current.get("max") or ""))
    if low_seconds is None or high_seconds is None:
        return None
    shift = 45 if target_intensity == "easy" else 75
    return {"min": _pace_text_from_seconds(low_seconds + shift), "max": _pace_text_from_seconds(high_seconds + shift)}


def _baseline_run_recommendation(planned_workout: dict) -> dict:
    workout_type = str(planned_workout.get("type") or "")
    miles = planned_workout.get("plannedMiles")
    duration = planned_workout.get("plannedDurationMin")
    if workout_type == "rest":
        return {"action": "rest", "label": "Rest Day", "miles": None, "durationMin": None, "paceRange": None, "intensity": "rest", "shouldRun": False}
    if workout_type == "long_run":
        return {"action": "run_as_planned", "label": "Long Run", "miles": miles, "durationMin": duration, "paceRange": _copy_pace_range(planned_workout.get("paceRange") or planned_workout.get("easyPaceRange")), "intensity": "easy", "shouldRun": True}
    if workout_type in {"tempo", "intervals", "race_pace"}:
        return {"action": "run_as_planned", "label": str(planned_workout.get("label") or "Quality Run"), "miles": miles, "durationMin": duration, "paceRange": _copy_pace_range(planned_workout.get("paceRange")), "intensity": "hard", "shouldRun": True}
    if workout_type == "cross_train":
        return {"action": "replace_with_walk_or_cross_train", "label": "Cross-Train", "miles": None, "durationMin": 20, "paceRange": None, "intensity": "very_easy", "shouldRun": False}
    if workout_type == "strength_only":
        return {"action": "rest", "label": "No Run Scheduled", "miles": None, "durationMin": None, "paceRange": None, "intensity": "rest", "shouldRun": False}
    return {"action": "run_as_planned", "label": "Easy Run", "miles": miles, "durationMin": duration, "paceRange": _copy_pace_range(planned_workout.get("paceRange") or planned_workout.get("easyPaceRange")), "intensity": "easy", "shouldRun": True}


def _same_numeric_value(left: float | int | None, right: float | int | None) -> bool:
    if left is None or right is None:
        return left is None and right is None
    return abs(float(left) - float(right)) < 0.05


def _same_pace_range(left: dict | None, right: dict | None) -> bool:
    if left is None or right is None:
        return left is None and right is None
    return str(left.get("min") or "") == str(right.get("min") or "") and str(left.get("max") or "") == str(right.get("max") or "")


def _plan_status_label(status: str) -> str:
    if status == "preserved":
        return "As Planned"
    if status == "modified":
        return "Adjusted"
    return "Changed"


def _preserved_overall_text(readiness: dict, flags: dict, run: dict, tags: set[str]) -> str:
    recovery_influence = [
        item
        for item, include in [
            ("Recovery score below threshold triggered a downshift.", readiness["componentScores"]["recovery"] < 0),
            ("Elevated resting HR added caution.", flags["elevatedHrCaution"]),
            ("High recent strain limited how much load to keep today.", flags["highStrainCaution"]),
            ("Subjective leg feedback materially lowered readiness.", readiness["componentScores"]["legs"] < 0),
            ("Mental fatigue reduced the ceiling for today's training.", flags["mentalDownshift"]),
        ]
        if include
    ]
    meaningful_caution = bool(
        recovery_influence
        or any(tag in tags for tag in {"protect_key_session", "protect_week_structure", "high_strain_caution", "elevated_hr_caution", "subjective_fatigue"})
    )

    if readiness["tier"] == "high" and not meaningful_caution:
        return "The planned session still fits today. Readiness is strong and the current signals support keeping the workout as written."

    if readiness["tier"] == "moderate" or meaningful_caution:
        if run.get("intensity") in {"easy", "very_easy"}:
            return "The planned session still makes sense today, but this should stay controlled. Recovery is not ideal, though the workout is light enough to keep in place."
        return "The planned session still makes sense today. There are some caution signals in the background, but not enough to change the session, so keep the effort measured."

    return "The session stays in place, but this is still a controlled day. The workout remains as planned because it already fits the day."


def _has_meaningful_caution(readiness: dict, flags: dict, tags: list[str] | set[str]) -> bool:
    return bool(
        readiness["componentScores"]["recovery"] < 0
        or flags["elevatedHrCaution"]
        or flags["highStrainCaution"]
        or flags["mentalDownshift"]
        or readiness["componentScores"]["legs"] < 0
        or any(tag in set(tags) for tag in {"protect_key_session", "protect_week_structure", "subjective_fatigue"})
    )


def _format_distance_text(miles: float | int | None, duration_min: int | None) -> str:
    if miles is not None:
        return f"{float(miles):.1f} mi"
    if duration_min is not None:
        return f"{int(duration_min)} min"
    return "no run"


def _planned_pace_text(planned_workout: dict) -> str:
    pace_range = planned_workout.get("paceRange") or planned_workout.get("easyPaceRange")
    return _pace_range_to_text(pace_range, str(_baseline_run_recommendation(planned_workout).get("intensity") or "easy"), True)


def _primary_driver_text(readiness: dict, flags: dict) -> str:
    if flags["injuryOverride"] or flags["forceRestOrCrossTrain"]:
        return "injury-related signals overrode the original plan"
    if readiness["componentScores"]["recovery"] < 0 and flags["highStrainCaution"]:
        return "recovery and recent load did not support the original stress"
    if flags["elevatedHrCaution"] and flags["highStrainCaution"]:
        return "elevated resting HR and prior-day strain stacked too much caution"
    if readiness["componentScores"]["recovery"] < 0:
        return "recovery came in below the support threshold"
    if flags["highStrainCaution"]:
        return "recent load was high enough to cap today's stress"
    if flags["elevatedHrCaution"]:
        return "resting HR was elevated enough to add caution"
    if readiness["componentScores"]["legs"] < 0:
        return "subjective leg feedback lowered the ceiling for the day"
    if flags["mentalDownshift"]:
        return "mental fatigue reduced the quality you were likely to get from more stress"
    return "the current signals supported the planned work"


def _detailed_overall_text(mapped: dict, readiness: dict, planned_workout: dict) -> str:
    plan_status = str(mapped["planStatus"])
    flags = readiness["flags"]
    driver = _primary_driver_text(readiness, flags)
    planned_label = str(planned_workout.get("label") or "planned session")
    final_label = str(mapped["summaryLabel"] or mapped["run"].get("label") or planned_label)

    if plan_status == "preserved":
        if readiness["tier"] == "high" and not _has_meaningful_caution(readiness, flags, mapped["reasoning"]["rationaleTags"]):
            return "Plan status: preserved. The session stayed in place because the current signals supported the planned load, so the main job is simply executing it cleanly."
        if readiness["componentScores"]["recovery"] < 0 and mapped["run"].get("intensity") in {"easy", "very_easy"}:
            return "Plan status: preserved. The session stayed in place because it was already low-risk, but recovery below threshold means it should remain fully controlled."
        return "Plan status: preserved. The workout stayed in place because the caution signals were manageable without changing the session, and the tradeoff is keeping the effort measured."

    if plan_status == "modified":
        return f"Plan status: modified. The original {planned_label.lower()} was adjusted to {final_label.lower()} because {driver}, so the tradeoff is preserving useful work while cutting the stress that carried the most risk."

    return f"Plan status: replaced. The original {planned_label.lower()} was taken off the table because {driver}, so the tradeoff is giving up training stress today to protect recovery and the rest of the week."


def _detailed_run_text(planned_workout: dict, mapped: dict) -> str:
    run = mapped["run"]
    planned_label = str(planned_workout.get("label") or "planned run")
    planned_distance = _format_distance_text(planned_workout.get("plannedMiles"), planned_workout.get("plannedDurationMin"))
    final_distance = _format_distance_text(run.get("miles"), run.get("durationMin"))
    plan_status = str(mapped["planStatus"])

    if not run.get("shouldRun"):
        return f"Planned: {planned_label} ({planned_distance}). Final: {run.get('label', 'No run')} ({final_distance}). Running was removed because the current signals did not justify adding training stress."

    if plan_status == "preserved":
        return f"Planned: {planned_label} ({planned_distance}). Final: unchanged at {final_distance}. The run stays in place because it already fits the intended stress for today."

    if planned_workout.get("type") == "long_run":
        planned_miles = planned_workout.get("plannedMiles")
        final_miles = run.get("miles")
        reduction_text = ""
        if planned_miles is not None and final_miles is not None and float(planned_miles) > 0:
            reduction = max(0, round((float(planned_miles) - float(final_miles)) / float(planned_miles) * 100))
            if reduction:
                reduction_text = f" Distance was reduced by about {reduction}% to keep the aerobic work without carrying extra fatigue."
        return f"Planned: {planned_label} ({planned_distance}). Final: {run.get('label', 'Adjusted run')} ({final_distance}). The long run kept its aerobic structure but lost some volume to control total load.{reduction_text}"

    return f"Planned: {planned_label} ({planned_distance}). Final: {run.get('label', 'Adjusted run')} ({final_distance}). Intensity was lowered because today's signals did not support the original workout stress."


def _detailed_pace_text(planned_workout: dict, mapped: dict, pace_text: str) -> str:
    run = mapped["run"]
    if not run.get("shouldRun"):
        return "No pace target is shown because today is not a run day."

    planned_pace = _planned_pace_text(planned_workout)
    if "easy_pace_substitution" in mapped["reasoning"]["rationaleTags"] and planned_pace != pace_text:
        return f"Pace shifted from {planned_pace} to {pace_text} so the effort matches the lower-intensity version of the day."

    if mapped["planStatus"] == "preserved":
        return f"Pace stays at {pace_text} because the original effort target still fits the session."

    return f"Pace is set at {pace_text} to match the final intensity and keep the work inside today's limits."


def _detailed_lift_text(mapped: dict, readiness: dict, planned_workout: dict) -> str:
    lift = mapped["lift"]
    run = mapped["run"]
    if lift["action"] == "no_lift":
        if readiness["flags"]["avoidHeavyLifting"] or not run.get("shouldRun"):
            return "Lifting was removed because recovery did not support adding more lower-body stress on top of today."
        return "Lifting was removed because the run already carries the training load the day can absorb."
    if lift["action"] == "core_only":
        return "Core-only lifting keeps some durability work in place without adding meaningful leg load."
    if lift["action"] == "mobility_only":
        return "Mobility replaces strength loading so you can keep movement in place without adding fatigue."
    if lift["action"] == "lift_light":
        if readiness["flags"]["avoidHeavyLifting"] or planned_workout.get("type") in {"tempo", "intervals", "race_pace", "long_run"}:
            return "Light strength is allowed, but heavy lower-body loading is off the table because the run already accounts for most of today's stress."
        return "Light strength is allowed because total stress remains controlled, but the lift should stay short and technically clean."
    return "Strength stays in place because readiness supports the planned loading."


def _detailed_recovery_text(readiness: dict, metrics: RecoveryMetrics) -> str:
    details: list[str] = []
    if readiness["componentScores"]["recovery"] < 0:
        details.append(f"Recovery came in at {metrics.recovery_score}%, below the 50% threshold, which was a primary reason for keeping the day conservative.")
    elif readiness["componentScores"]["recovery"] > 0:
        details.append(f"Recovery came in at {metrics.recovery_score}%, which supported carrying the planned workload.")
    else:
        details.append(f"Recovery came in at {metrics.recovery_score}%, which kept the day in a neutral range rather than actively supporting more load.")
    if readiness["flags"]["elevatedHrCaution"] and readiness["flags"]["highStrainCaution"]:
        details.append(f"Resting HR was elevated and yesterday's strain was {metrics.strain:.1f}, so those signals combined to tighten the guardrails.")
    elif readiness["flags"]["elevatedHrCaution"]:
        details.append("Resting HR was elevated above baseline, which added caution even if the rest of the check-in was workable.")
    elif readiness["flags"]["highStrainCaution"]:
        details.append(f"Yesterday's strain was {metrics.strain:.1f}, which was high enough to limit how much stress made sense to keep today.")
    if readiness["componentScores"]["legs"] < 0:
        details.append("Subjective leg feedback lowered readiness enough to matter in the final call.")
    if readiness["flags"]["mentalDownshift"]:
        details.append("Mental fatigue also lowered the ceiling for how hard the day should feel.")
    return " ".join(details)


def _detailed_warnings(mapped: dict, readiness: dict) -> list[str]:
    warnings: list[str] = []
    run = mapped["run"]
    lift = mapped["lift"]
    if run.get("shouldRun") and run.get("intensity") in {"easy", "very_easy"}:
        warnings.append("Keep the run conversational. If the effort drifts above easy, shorten it.")
    if not run.get("shouldRun"):
        warnings.append("Do not turn today into a bonus run. The recommendation is to back off, not make up work.")
    if lift["action"] == "no_lift":
        warnings.append("Do not add lifting on top of today's recommendation.")
    elif readiness["flags"]["avoidHeavyLifting"] or lift["action"] in {"core_only", "mobility_only"}:
        warnings.append("Do not add heavy lower-body lifting today.")
    if "protect_key_session" in mapped["reasoning"]["rationaleTags"]:
        warnings.append("Keep today measured so the next key session has a better chance of landing well.")
    if readiness["flags"]["injuryOverride"] or readiness["flags"]["forceRestOrCrossTrain"]:
        warnings.append("If pain, tingling, dizziness, or other unusual symptoms show up, stop and reassess.")
    return warnings[:3]


def _plan_status(planned_workout: dict, baseline_run: dict, final_run: dict, lift: dict) -> str:
    workout_type = str(planned_workout.get("type") or "")

    if workout_type == "strength_only":
        if lift.get("action") == "lift_as_planned":
            return "preserved"
        if lift.get("action") == "no_lift":
            return "replaced"
        return "modified"

    if workout_type == "rest":
        return "preserved" if final_run.get("action") == "rest" and not final_run.get("shouldRun") and not lift.get("shouldLift") else "replaced"

    if workout_type == "cross_train":
        if final_run.get("action") == "replace_with_walk_or_cross_train" and not final_run.get("shouldRun"):
            return "preserved" if _same_numeric_value(final_run.get("durationMin"), baseline_run.get("durationMin")) else "modified"
        return "replaced"

    if not final_run.get("shouldRun") or final_run.get("action") in {"replace_with_walk_or_cross_train", "rest"}:
        return "replaced"

    preserved = (
        str(final_run.get("action") or "") == str(baseline_run.get("action") or "")
        and str(final_run.get("label") or "") == str(baseline_run.get("label") or "")
        and str(final_run.get("intensity") or "") == str(baseline_run.get("intensity") or "")
        and bool(final_run.get("shouldRun")) == bool(baseline_run.get("shouldRun"))
        and _same_numeric_value(final_run.get("miles"), baseline_run.get("miles"))
        and _same_numeric_value(final_run.get("durationMin"), baseline_run.get("durationMin"))
        and _same_pace_range(final_run.get("paceRange"), baseline_run.get("paceRange"))
    )
    return "preserved" if preserved else "modified"


def _deterministic_daily_map(readiness: dict, planned_workout: dict, context: dict, mode: str) -> dict:
    baseline_run = _baseline_run_recommendation(planned_workout)
    run = dict(baseline_run)
    run_logic: list[str] = []
    lift_logic: list[str] = []
    plan_protection: list[str] = []
    tags: set[str] = set()
    flags = readiness["flags"]
    planned_miles = float(planned_workout["plannedMiles"]) if planned_workout.get("plannedMiles") is not None else None
    force_no_speed = bool(flags["avoidSpeedWork"] or (flags["highStrainCaution"] and flags["elevatedHrCaution"]))

    if flags["injuryOverride"] or flags["forceRestOrCrossTrain"]:
        run = {"action": "replace_with_walk_or_cross_train", "label": "Recovery / Cross-Train", "miles": None, "durationMin": 20, "paceRange": None, "intensity": "very_easy", "shouldRun": False}
        run_logic.append("Safety flags override the planned session and remove training stress.")
        tags.update({"injury_override", "replace_with_cross_train"})
    elif readiness["decision"] == "maintain":
        if planned_workout["type"] in {"tempo", "intervals", "race_pace"} and (force_no_speed or flags["reduceIntensity"]):
            run.update({"action": "run_easy", "label": "Easy Run", "intensity": "easy", "shouldRun": True})
            run_logic.append("Preserved movement but removed workout intensity.")
            tags.add("downshift_intensity")
        elif planned_workout["type"] == "easy_run" and flags["reduceIntensity"]:
            run.update({"action": "replace_with_recovery_run", "label": "Recovery Run", "intensity": "very_easy"})
            run_logic.append("Lowered the easy run to recovery effort because readiness is not fully supportive.")
            tags.add("downshift_intensity")
        elif planned_workout["type"] == "long_run" and (flags["reduceIntensity"] or flags["reduceVolume"] or flags["highStrainCaution"]):
            run.update({"action": "shorten_run", "label": "Easy Long Run", "intensity": "easy"})
            run_logic.append("Kept the aerobic structure but trimmed the long run stress.")
            tags.add("reduce_volume")
    elif readiness["decision"] == "pull_back":
        if planned_workout["type"] in {"tempo", "intervals", "race_pace"}:
            if sum(1 for item in [flags["highStrainCaution"], flags["elevatedHrCaution"], flags["mentalDownshift"]] if item) >= 2:
                run = {"action": "replace_with_walk_or_cross_train", "label": "Pull Back Day", "miles": None, "durationMin": 20, "paceRange": None, "intensity": "very_easy", "shouldRun": False}
                run_logic.append("Removed quality work entirely because low readiness and caution flags make it too costly.")
            else:
                run.update({"action": "replace_with_recovery_run", "label": "Easy Run" if mode == "aggressive" else "Recovery Run", "intensity": "easy" if mode == "aggressive" else "very_easy", "shouldRun": True})
                run_logic.append("Replaced the quality session with low-stress aerobic work.")
            tags.update({"replace_quality_session", "downshift_intensity"})
        elif planned_workout["type"] == "long_run":
            run.update({"action": "shorten_run", "label": "Easy Run", "intensity": "easy", "shouldRun": True})
            run_logic.append("Low readiness removes the full long-run load and keeps only manageable aerobic work.")
            tags.add("reduce_volume")
        elif planned_workout["type"] == "easy_run":
            if sum(1 for item in [flags["highStrainCaution"], flags["elevatedHrCaution"], flags["mentalDownshift"]] if item) >= 2:
                run = {"action": "replace_with_walk_or_cross_train", "label": "Pull Back Day", "miles": None, "durationMin": 20, "paceRange": None, "intensity": "very_easy", "shouldRun": False}
                run_logic.append("The easy run was removed because multiple caution flags suggest recovery is the better use of today.")
                tags.add("pull_back_day")
            else:
                run.update({"action": "replace_with_recovery_run", "label": "Recovery Run", "intensity": "easy" if mode == "aggressive" else "very_easy", "shouldRun": True})
                run_logic.append("The easy run stays in place but shifts toward recovery work.")
                tags.add("downshift_intensity")

    percent = 0
    if run["shouldRun"]:
        if readiness["decision"] == "maintain" and flags["reduceVolume"]:
            percent = -10 if mode == "aggressive" else -15
        elif readiness["decision"] == "maintain" and planned_workout["type"] == "long_run" and flags["highStrainCaution"]:
            percent = -10
        elif readiness["decision"] == "maintain" and planned_workout["type"] == "long_run":
            percent = 0
        elif readiness["decision"] == "pull_back" and planned_workout["type"] == "long_run":
            percent = -20 if mode == "aggressive" else -30
        elif readiness["decision"] == "pull_back" and flags["reduceVolume"]:
            percent = -22 if mode == "aggressive" else -32
        elif readiness["decision"] == "push" and mode == "aggressive" and planned_workout["type"] in {"easy_run", "long_run"} and not flags["highStrainCaution"] and not flags["elevatedHrCaution"]:
            percent = 5 if planned_workout["type"] == "long_run" else 8
        if planned_miles is not None:
            adjusted_miles = _adjust_volume(planned_miles, percent)
            run["miles"] = round(float(adjusted_miles), 1) if adjusted_miles is not None else None
        else:
            run["miles"] = None
        if planned_workout["type"] == "long_run" and planned_miles is not None and run["miles"] is not None and not (flags["injuryOverride"] or flags["forceRestOrCrossTrain"]):
            run["miles"] = round(max(float(run["miles"]), round(float(planned_miles) * 0.5, 1)), 1)
        if percent < 0:
            run_logic.append("Reduced volume to match current recovery capacity.")
            tags.add("reduce_volume")
        elif percent > 0:
            run_logic.append("Added a small amount of volume because readiness is high and the planned day is low risk.")
            tags.add("preserve_planned_volume")
        if run["durationMin"] is None and run["miles"] is not None:
            minutes_per_mile = 10.5 if run["intensity"] == "easy" else 11.5 if run["intensity"] == "very_easy" else 9.5 if run["intensity"] == "moderate" else 8.5
            run["durationMin"] = max(20, int(round(float(run["miles"]) * minutes_per_mile)))
        elif run["durationMin"] is None and run["miles"] is None:
            run["durationMin"] = 25 if run["shouldRun"] else 20
        elif run["durationMin"] is not None and percent != 0:
            run["durationMin"] = max(20, int(round(int(run["durationMin"]) * (100 + percent) / 100)))
    else:
        run["durationMin"] = run["durationMin"] or 20

    if context.get("nextKeyWorkoutInDays") is not None and int(context["nextKeyWorkoutInDays"]) <= 2 and (readiness["decision"] != "push" or flags["highStrainCaution"] or flags["elevatedHrCaution"]):
        plan_protection.append("Kept today lighter to protect the next key workout.")
        tags.add("protect_key_session")
    if planned_workout.get("isKeySession") and readiness["decision"] != "push":
        plan_protection.append("Protected the rest of the week by removing pressure from today's key session.")
        tags.add("protect_week_structure")

    if run["shouldRun"] and planned_workout["type"] in {"tempo", "intervals", "race_pace"} and force_no_speed and run["intensity"] == "hard":
        run.update({"action": "run_easy", "label": "Easy Run", "intensity": "easy"})
        run_logic.append("Stacked caution signals removed speed work even though the day was otherwise maintainable.")
        tags.add("downshift_intensity")

    run["paceRange"] = _adjusted_pace_range(planned_workout, str(run["intensity"])) if run["shouldRun"] else None
    baseline_intensity = _baseline_run_recommendation(planned_workout)["intensity"]
    if run["shouldRun"] and run["intensity"] != baseline_intensity:
        run_logic.append("Used easier pace guidance to match the downshifted intensity.")
        tags.add("easy_pace_substitution")

    strength_backlog = context.get("completedStrengthSessionsThisWeek") is not None and context.get("targetStrengthSessionsPerWeek") is not None and int(context["completedStrengthSessionsThisWeek"]) < int(context["targetStrengthSessionsPerWeek"])
    if flags["injuryOverride"] or flags["forceRestOrCrossTrain"]:
        lift = {"action": "no_lift", "label": "No lift today", "shouldLift": False, "guidance": ["Prioritize recovery and reassess tomorrow."]}
    elif planned_workout["type"] == "strength_only":
        if readiness["decision"] == "push":
            lift = {"action": "lift_as_planned", "label": "Strength as planned", "shouldLift": True, "guidance": ["Keep the lift technically clean and stop short of grinding reps."]}
        elif readiness["decision"] == "maintain":
            lift = {"action": "lift_light", "label": "Light strength", "shouldLift": True, "guidance": ["Keep total lift under 20 minutes.", "No heavy lower-body loading today."]}
        else:
            lift = {"action": "core_only" if mode == "aggressive" else "mobility_only", "label": "Core only" if mode == "aggressive" else "Mobility only", "shouldLift": True, "guidance": ["Keep the session short and low load."] if mode == "aggressive" else ["Keep the session gentle and under 20 minutes."]}
    elif readiness["decision"] == "pull_back":
        lift = {"action": "core_only", "label": "Core only", "shouldLift": True, "guidance": ["Keep the session short and low load.", "Use core, hips, and glute activation only."]} if mode == "aggressive" and strength_backlog and not flags["avoidHeavyLifting"] else {"action": "no_lift", "label": "No lift today", "shouldLift": False, "guidance": ["Skip lifting so recovery can be the main training objective today."]}
    elif flags["avoidHeavyLifting"] and planned_workout["type"] in {"tempo", "intervals", "race_pace", "long_run"}:
        lift = {"action": "no_lift", "label": "No lift today", "shouldLift": False, "guidance": ["Skip lifting so the reduced run still has room to absorb and recover."]}
    elif run["intensity"] == "hard":
        lift = {"action": "lift_light", "label": "Light strength", "shouldLift": True, "guidance": ["Keep total lift under 20 minutes.", "Use upper body, trunk, or light accessory work only."]} if not flags["avoidHeavyLifting"] else {"action": "no_lift", "label": "No lift today", "shouldLift": False, "guidance": ["Heavy lifting is removed because the run already carries the day's training stress."]}
    elif run["intensity"] in {"easy", "very_easy"} and readiness["tier"] != "low" and strength_backlog:
        if mode == "aggressive":
            lift = {"action": "lift_light", "label": "Light strength", "shouldLift": True, "guidance": ["Keep total lift under 20 minutes.", "No heavy squats or loaded single-leg work.", "Use bodyweight or light dumbbells only."]}
        else:
            lift = {"action": "core_only", "label": "Core only", "shouldLift": True, "guidance": ["Keep the session short and low load.", "Use core, hips, and glute activation only."]}
    else:
        lift = {"action": "no_lift", "label": "No lift today", "shouldLift": False, "guidance": ["No extra lifting is needed to get the intended benefit from today."]}

    if lift["action"] == "no_lift":
        lift_logic.append("No lift today because recovery is more important than adding extra training load.")
        tags.add("no_lift")
    elif lift["action"] == "lift_light":
        lift_logic.append("Light strength is allowed because run intensity is controlled and total stress stays capped.")
        tags.add("light_lift_allowed")
    elif lift["action"] == "core_only":
        lift_logic.append("Only trunk and light activation work are allowed so strength work stays restorative.")
        tags.add("core_only")
    else:
        lift_logic.append("Mobility replaces strength loading because readiness does not support more stress.")
        tags.add("mobility_only")

    summary = "Easy Run" if run["shouldRun"] and run["intensity"] == "easy" else "Recovery Run" if run["shouldRun"] and run["intensity"] == "very_easy" else "Recovery Day" if not run["shouldRun"] and not lift["shouldLift"] else "Mobility Day" if not run["shouldRun"] and lift["action"] == "mobility_only" else "Light Strength Day" if not run["shouldRun"] and lift["action"] == "core_only" else run["label"]
    if flags["avoidSpeedWork"]:
        tags.add("avoid_speed_work")
    if flags["mentalDownshift"]:
        tags.add("subjective_fatigue")
    if flags["highStrainCaution"]:
        tags.add("high_strain_caution")
    if flags["elevatedHrCaution"]:
        tags.add("elevated_hr_caution")
    plan_status = _plan_status(planned_workout, baseline_run, run, lift)
    overall = "The planned session has been adjusted based on readiness and recovery signals. We preserve structure while reducing stress."
    if plan_status == "preserved":
        overall = _preserved_overall_text(readiness, flags, run, tags)
    elif plan_status == "replaced":
        overall = "The planned session has been replaced due to recovery and risk signals. The priority is protecting the athlete and the rest of the week."

    return {
        "planStatus": plan_status,
        "planStatusLabel": _plan_status_label(plan_status),
        "summaryLabel": summary,
        "run": run,
        "lift": lift,
        "reasoning": {
            "overall": overall,
            "runLogic": run_logic,
            "liftLogic": lift_logic,
            "recoveryInfluence": [
                item for item, include in [
                    ("Recovery score below threshold triggered a downshift.", readiness["componentScores"]["recovery"] < 0),
                    ("Elevated resting HR added caution.", flags["elevatedHrCaution"]),
                    ("High recent strain limited how much load to keep today.", flags["highStrainCaution"]),
                    ("Subjective leg feedback materially lowered readiness.", readiness["componentScores"]["legs"] < 0),
                    ("Mental fatigue reduced the ceiling for today's training.", flags["mentalDownshift"]),
                ] if include
            ],
            "planProtection": plan_protection,
            "rationaleTags": sorted(tags),
        },
        "ui": {"primaryBadge": summary, "secondaryBadge": "Conservative" if mode == "conservative" else "Aggressive", "canToggleMode": not (flags["injuryOverride"] or flags["forceRestOrCrossTrain"])},
    }


def _recommendation_from_daily_map(
    mapped: dict,
    readiness: dict,
    planned_workout: dict,
    weekly_intent: WeeklyIntent,
    pace_model: PaceModel,
    today: date,
    metrics: RecoveryMetrics,
    mode: str,
) -> Recommendation:
    run = mapped["run"]
    lift = mapped["lift"]
    pace_text = _pace_range_to_text(run.get("paceRange"), str(run.get("intensity") or "rest"), bool(run.get("shouldRun")))
    workout = mapped["summaryLabel"] if run.get("shouldRun") else ("Rest and recovery" if not lift.get("shouldLift") else lift.get("label"))
    lift_focus = "No lifting" if lift["action"] == "no_lift" else lift["label"]
    lift_guidance = " ".join(lift.get("guidance") or [])
    detailed_overall = _detailed_overall_text(mapped, readiness, planned_workout)
    warnings = _detailed_warnings(mapped, readiness)
    planned_distance = float(planned_workout.get("plannedMiles") or 0.0)
    planned_pace = str(planned_workout.get("plannedTextPace") or "Rest day")
    readiness_status = "supported" if readiness["decision"] == "push" else "partly supported" if readiness["decision"] == "maintain" else "not supported"
    return Recommendation(
        date=today.isoformat(),
        workout=workout,
        intensity=str(run.get("intensity") or "rest").replace("_", " "),
        duration_minutes=int(run.get("durationMin") or 0),
        run_distance_miles=float(run.get("miles") or 0.0),
        run_pace_guidance=pace_text,
        lift_focus=lift_focus,
        lift_guidance=lift_guidance,
        recap=[
            f"Latest WHOOP: recovery {metrics.recovery_score}%, sleep {metrics.sleep_hours:.1f} hours, strain {metrics.strain:.1f}.",
            f"This week is a {weekly_intent.week_type} week in {weekly_intent.phase.lower()} with a primary focus on {weekly_intent.primary_adaptation}.",
        ],
        explanation=[mapped["reasoning"]["overall"]],
        explanation_sections={
            "overall": detailed_overall,
            "run": _detailed_run_text(planned_workout, mapped),
            "pace": _detailed_pace_text(planned_workout, mapped, pace_text),
            "lift": _detailed_lift_text(mapped, readiness, planned_workout),
            "recovery": _detailed_recovery_text(readiness, metrics),
        },
        warnings=warnings,
        confidence="high" if readiness["decision"] == "push" else "medium",
        planned_workout=str(planned_workout.get("label") or ""),
        planned_run_distance_miles=planned_distance,
        planned_pace_guidance=planned_pace,
        pace_model=pace_model.to_dict(),
        weekly_intent=weekly_intent.to_dict(),
        daily_adaptation={
            "planned_session": str(planned_workout.get("label") or ""),
            "readiness_status": readiness_status,
            "readiness_score": int(readiness["score"]),
            "readiness_tier": str(readiness["tier"]),
            "decision": str(readiness["decision"]),
            "flags": dict(readiness["flags"]),
            "adjustment_reason": mapped["reasoning"]["overall"],
            "adjusted_session": workout,
            "weekly_goal_remains": _weekly_goal_phrase(weekly_intent),
            "reschedule_suggestion": _reschedule_guidance(weekly_intent, readiness_status),
            "mode": mode,
            "plan_status": mapped["planStatus"],
            "plan_status_label": mapped["planStatusLabel"],
            "summary_label": mapped["summaryLabel"],
            "run": dict(mapped["run"]),
            "lift": dict(mapped["lift"]),
            "rationale_tags": list(mapped["reasoning"]["rationaleTags"]),
        },
    )


#
# Active source of truth for daily training decisions.
# This deterministic engine now drives /api/recommendation and owns readiness-based
# workout, pace, lift, and mode mapping for the app's daily prescription flow.
#
def deterministic_recommendation(
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    today: date | None = None,
    subjective_feedback: dict | None = None,
    weekly_intent: WeeklyIntent | None = None,
    mode: str = "conservative",
) -> Recommendation:
    today = today or max(parse_date(item.day) for item in metrics)
    latest_metrics = _latest_metric_on_or_before(metrics, today)
    if latest_metrics is None:
        raise ValueError(f"No Whoop-style metrics found for {today.isoformat()}")
    weekly_intent = weekly_intent or build_weekly_intent(profile, runs, metrics, today=today)
    pace_model = build_pace_model(profile, runs)
    planned_workout = _build_planned_workout_payload(weekly_intent, profile, today)
    readiness = calculate_readiness_result(latest_metrics, average_resting_hr(metrics, days=7) or None, subjective_feedback)
    context = _build_deterministic_context(profile, runs, metrics, today, subjective_feedback, weekly_intent)
    mapped = _deterministic_daily_map(readiness, planned_workout, context, mode)
    return _recommendation_from_daily_map(mapped, readiness, planned_workout, weekly_intent, pace_model, today, latest_metrics, mode)


def deterministic_recommendation_options(
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    today: date | None = None,
    subjective_feedback: dict | None = None,
    weekly_intent: WeeklyIntent | None = None,
) -> tuple[list[dict], str]:
    conservative = deterministic_recommendation(profile, runs, metrics, today=today, subjective_feedback=subjective_feedback, weekly_intent=weekly_intent, mode="conservative")
    aggressive = deterministic_recommendation(profile, runs, metrics, today=today, subjective_feedback=subjective_feedback, weekly_intent=weekly_intent, mode="aggressive")
    feedback = subjective_feedback or {}
    physical = str(feedback.get("physical_feeling") or "").strip().lower()
    default_key = "conservative"
    if conservative.daily_adaptation.get("readiness_status") == "supported" and physical not in {"heavy", "sore", "injured", "sick"}:
        default_key = "aggressive"
    options = [
        {
            "key": "conservative",
            "label": "Conservative",
            "when_to_choose": "Best if you feel flat, short on time, or want to protect the rest of the week.",
            "recommendation": conservative.to_dict(),
        },
        {
            "key": "aggressive",
            "label": "More Aggressive",
            "when_to_choose": "Best if warm-up feels smooth and you want to stay closer to the planned training stimulus.",
            "recommendation": aggressive.to_dict(),
        },
    ]
    if aggressive.daily_adaptation.get("mode") == conservative.daily_adaptation.get("mode"):
        default_key = "conservative"
    return options, default_key


def _readiness_status(latest_metrics: RecoveryMetrics, baseline_rhr: float, subjective_feedback: dict | None) -> tuple[str, list[str], bool, bool]:
    feedback = subjective_feedback or {}
    physical = str(feedback.get("physical_feeling") or "").strip().lower()
    mental = str(feedback.get("mental_feeling") or "").strip().lower()
    notes = str(feedback.get("notes") or "").strip().lower()

    poor_sleep = latest_metrics.sleep_hours < 6.0
    low_recovery = latest_metrics.recovery_score < 45
    elevated_rhr = bool(baseline_rhr and latest_metrics.resting_hr >= baseline_rhr + 4)
    soreness = physical in {"heavy", "sore", "injured"}
    mental_drag = mental in {"stressed", "drained"}
    illness = physical == "sick" or any(token in notes for token in ("sick", "headache", "fever", "nausea", "injury", "sharp pain"))

    reasons: list[str] = []
    if poor_sleep:
        reasons.append("sleep is low")
    if low_recovery:
        reasons.append("recovery is low")
    if elevated_rhr:
        reasons.append("resting heart rate is elevated")
    if soreness:
        reasons.append("legs feel sore or heavy")
    if mental_drag:
        reasons.append("mental readiness is suppressed")
    if illness:
        reasons.append("illness or pain was reported")

    if illness or (low_recovery and poor_sleep) or (soreness and mental_drag and elevated_rhr):
        return "not supported", reasons, True, True
    if reasons:
        return "partly supported", reasons, True, False
    return "supported", reasons, False, False


#
# Legacy daily coach function retained for compatibility with baseline planning.
# This is NOT used for live daily recommendations anymore.
# It is kept only for calendar/baseline logic and older helper paths that still
# need a stable non-API planning recommendation.
#
def coach_recommendation(
    profile: AthleteProfile,
    runs: list[Run],
    metrics: list[RecoveryMetrics],
    today: date | None = None,
    subjective_feedback: dict | None = None,
    weekly_intent: WeeklyIntent | None = None,
) -> Recommendation:
    today = today or max(parse_date(item.day) for item in metrics)
    today_str = today.isoformat()
    latest_metrics = _latest_metric_on_or_before(metrics, today)
    if latest_metrics is None:
        raise ValueError(f"No Whoop-style metrics found for {today_str}")

    weekly_intent = weekly_intent or build_weekly_intent(profile, runs, metrics, today=today)
    pace_model = build_pace_model(profile, runs)
    seven_day_miles = recent_mileage(runs, days=7)
    three_day_load = acute_load(runs, days=3)
    baseline_rhr = average_resting_hr(metrics, days=7)
    prior_run = previous_run(runs, today)
    planned = planned_session_for_day(weekly_intent, profile, today)
    readiness_status, readiness_reasons, downshift, severe_block = _readiness_status(latest_metrics, baseline_rhr, subjective_feedback)

    explanation: list[str] = []
    warnings: list[str] = []
    recap: list[str] = []

    if prior_run:
        recap.append(
            f"Most recent run: {prior_run.distance_miles:.1f} miles in {prior_run.duration_minutes} minutes at about {_format_pace_value(prior_run.average_pace_min_per_mile)}/mi."
            if prior_run.average_pace_min_per_mile
            else f"Most recent run: {prior_run.distance_miles:.1f} miles in {prior_run.duration_minutes} minutes."
        )
    recap.append(f"Seven-day running total: {seven_day_miles:.1f} miles.")
    recap.append(
        f"Latest WHOOP: recovery {latest_metrics.recovery_score}%, sleep {latest_metrics.sleep_hours:.1f} hours, strain {latest_metrics.strain:.1f}."
    )
    recap.append(
        f"This week is a {weekly_intent.week_type} week in {weekly_intent.phase.lower()} with a primary focus on {weekly_intent.primary_adaptation}."
    )

    planned_workout = str(planned["workout"])
    planned_distance = float(planned["distance_miles"])
    planned_pace = str(planned["pace_guidance"])
    if planned_distance <= 0 and not readiness_reasons:
        planned_workout = "Easy aerobic run"
        planned_distance = round(max(3.5, weekly_intent.mileage_target * 0.15), 1)
        planned_pace = pace_model.easy.pace_range
        planned["intensity"] = "easy"
    workout = planned_workout
    intensity = str(planned["intensity"])
    run_distance = planned_distance
    run_pace = planned_pace
    duration = int(max(0, round(run_distance * 10.2))) if run_distance > 0 else 0
    lift_focus = "Today is a lifting off-day" if intensity in {"moderate", "hard", "rest"} else "Single-Leg Strength + Core"
    lift_guidance = "Today is a lifting off-day." if "off-day" in lift_focus else "Keep strength short, controlled, and secondary to the run."

    if severe_block:
        workout = "Rest and recovery"
        intensity = "rest"
        run_distance = 0.0
        run_pace = "Rest day"
        duration = 0
        lift_focus = "No lifting"
        lift_guidance = "Rest, walk lightly if you want, and use mobility or tissue care only if it feels restorative."
        explanation.append("Recovery and subjective signals do not support training stress today, so the day shifts fully to recovery.")
    elif downshift and intensity in {"hard", "moderate"}:
        workout = "Easy aerobic run"
        intensity = "easy"
        run_distance = round(max(3.0, planned_distance * 0.75), 1)
        run_pace = pace_model.easy.pace_range
        duration = 45
        lift_focus = "Today is a lifting off-day"
        lift_guidance = "Today is a lifting off-day."
        explanation.append("Readiness only partly supports the original plan, so the session was scaled back to protect the week's main objective.")
    elif downshift and intensity == "easy":
        workout = "Short easy run or rest"
        intensity = "very easy"
        run_distance = round(max(0.0, planned_distance * 0.7), 1) if planned_distance > 0 else 0.0
        run_pace = pace_model.easy.pace_range if run_distance > 0 else "Rest day"
        duration = int(max(0, round(run_distance * 10.8))) if run_distance > 0 else 0
        lift_focus = "No lifting" if latest_metrics.recovery_score < 45 else "Mobility and tissue care"
        lift_guidance = "Keep the day restorative and skip formal lifting if the legs feel worse during warm-up."
        explanation.append("Today's easy work stays short because recovery is not strong enough to push the volume.")
    else:
        if workout == "Easy aerobic run":
            duration = 45
            explanation.append("Recent work and the weekly structure point toward an aerobic support day rather than adding more stress.")
        explanation.append("Today's session stays aligned with the weekly plan because recovery and subjective signals support it.")

    if weekly_intent.primary_adaptation == "threshold" and "threshold" in planned_workout.lower():
        explanation.append("The week's key adaptation is threshold development, so we want one controlled threshold stimulus somewhere in the week.")
    elif weekly_intent.primary_adaptation == "race-specific stamina":
        explanation.append("The week's key adaptation is race-specific stamina, so sustained work near half marathon effort remains the anchor.")
    elif weekly_intent.primary_adaptation == "volume":
        explanation.append("The week is volume-oriented, so durability and consistent mileage matter more than one aggressive workout.")
    else:
        explanation.append("The week is absorb-focused, so freshness matters more than squeezing in extra work.")

    if three_day_load >= 150:
        warnings.append("Your last few days already carry meaningful load, so keep today controlled unless your legs clearly improve in the warm-up.")
    if readiness_reasons:
        warnings.append(f"Adjustment pressure today: {', '.join(readiness_reasons)}.")
    if prior_run and prior_run.distance_miles >= 7:
        warnings.append("Recent long-run stress is still in the system, so avoid stacking another demanding leg day too soon.")

    if readiness_status == "supported":
        adjustment_reason = "Recovery and subjective signals support the planned work."
    elif readiness_status == "partly supported":
        adjustment_reason = ", ".join(readiness_reasons[:3]).capitalize() + "."
    else:
        adjustment_reason = "Training stress is not well supported today."

    daily_adaptation = DailyAdaptation(
        planned_session=planned_workout,
        readiness_status=readiness_status,
        adjustment_reason=adjustment_reason,
        adjusted_session=workout if workout != planned_workout else f"Keep {planned_workout.lower()}",
        weekly_goal_remains=_weekly_goal_phrase(weekly_intent),
        reschedule_suggestion=_reschedule_guidance(weekly_intent, readiness_status),
    )

    confidence = "high" if readiness_status == "supported" else "medium"
    if severe_block:
        confidence = "high"

    overall_text = explanation[0] if explanation else ""
    return Recommendation(
        date=today_str,
        workout=workout,
        intensity=intensity,
        duration_minutes=duration,
        run_distance_miles=run_distance,
        run_pace_guidance=run_pace,
        lift_focus=lift_focus,
        lift_guidance=lift_guidance,
        recap=recap,
        explanation=explanation,
        explanation_sections={
            "overall": overall_text,
            "run": f"Original plan: {planned_workout}. Today's run became {workout.lower()} to stay aligned with the week's purpose." if workout != planned_workout else f"Today's run stays with the planned session: {planned_workout.lower()}.",
            "pace": f"The pace band of {run_pace} matches the adjusted goal for the day, while the week's target pace anchors remain stable.",
            "lift": lift_guidance,
            "recovery": f"Recovery is {latest_metrics.recovery_score}% with {latest_metrics.sleep_hours:.1f} hours of sleep and {latest_metrics.strain:.1f} strain, which set today's ceiling.",
        },
        warnings=warnings,
        confidence=confidence,
        planned_workout=planned_workout,
        planned_run_distance_miles=planned_distance,
        planned_pace_guidance=planned_pace,
        pace_model=pace_model.to_dict(),
        weekly_intent=weekly_intent.to_dict(),
        daily_adaptation=daily_adaptation.to_dict(),
    )


def assess_recommendation_uncertainty(
    profile: AthleteProfile,
    recommendation: Recommendation,
    subjective_feedback: dict | None = None,
) -> list[dict]:
    feedback = subjective_feedback or {}
    notes = str(feedback.get("notes") or "").strip()
    physical = str(feedback.get("physical_feeling") or "").strip().lower()
    mental = str(feedback.get("mental_feeling") or "").strip().lower()
    questions: list[dict] = []

    if recommendation.confidence != "high":
        questions.append(
            {
                "id": "push_level",
                "prompt": "How much do you want to push today if the legs warm up well?",
                "why_it_matters": "This helps choose between preserving the safer option or leaning into the more ambitious one.",
                "suggested_answers": ["Keep it conservative", "Open to a steady push", "Feeling ready to press"],
            }
        )
    if not str(profile.goal_half_marathon_time or "").strip():
        questions.append(
            {
                "id": "goal_time",
                "prompt": "What half marathon goal time are you currently training toward?",
                "why_it_matters": "A goal time improves race-pace and threshold estimates.",
                "suggested_answers": ["Sub-2:00", "Sub-1:50", "Sub-1:40"],
            }
        )
    if not str(profile.recent_race_result or "").strip():
        questions.append(
            {
                "id": "benchmark",
                "prompt": "Do you have a recent race result or benchmark workout worth anchoring to?",
                "why_it_matters": "Recent benchmarks make the pace model feel more earned and less generic.",
                "suggested_answers": ["Recent 5K", "Recent 10K", "No benchmark yet"],
            }
        )
    if not profile.max_comfortable_long_run_miles:
        questions.append(
            {
                "id": "long_run_cap",
                "prompt": "What long run still feels comfortably within your current durability?",
                "why_it_matters": "That cap helps the coach avoid projecting a long run that feels unrealistic.",
                "suggested_answers": ["8 miles feels good", "10 miles feels good", "Not sure yet"],
            }
        )
    if not notes and physical in {"normal", "fresh"} and mental in {"steady", "sharp"} and recommendation.confidence != "high":
        questions.append(
            {
                "id": "hidden_constraints",
                "prompt": "Any hidden constraint today like time limits, soreness on hills, or life stress?",
                "why_it_matters": "Small day-of constraints often decide whether the athlete should choose the conservative or aggressive option.",
                "suggested_answers": ["Short on time", "Legs dislike hills", "No extra constraint"],
            }
        )

    return questions[:3]


def build_recommendation_options(
    recommendation: Recommendation,
    profile: AthleteProfile,
    subjective_feedback: dict | None = None,
) -> tuple[list[dict], str]:
    # Legacy compatibility helper retained for older callers and tests.
    # /api/recommendation now uses deterministic_recommendation_options(...) directly.
    conservative = recommendation_from_dict(recommendation.to_dict())
    aggressive = recommendation_from_dict(recommendation.to_dict())

    if recommendation.daily_adaptation.get("mode") == "conservative":
        aggressive.run_distance_miles = round(max(conservative.run_distance_miles, aggressive.run_distance_miles + 0.3), 1)
        aggressive.duration_minutes = max(aggressive.duration_minutes, int(round(aggressive.run_distance_miles * 10.2))) if aggressive.run_distance_miles > 0 else aggressive.duration_minutes
        aggressive.daily_adaptation = {
            **dict(aggressive.daily_adaptation or {}),
            "mode": "aggressive",
            "adjustment_reason": "This version stays a little closer to the original planned load while keeping the same deterministic safety rules.",
        }
    else:
        conservative.run_distance_miles = round(max(0.0, conservative.run_distance_miles - 0.3), 1)
        conservative.duration_minutes = max(0, int(round(conservative.run_distance_miles * 10.2))) if conservative.run_distance_miles > 0 else 0
        conservative.daily_adaptation = {
            **dict(conservative.daily_adaptation or {}),
            "mode": "conservative",
            "adjustment_reason": "This version gives you a little more recovery room while keeping the same deterministic safety rules.",
        }

    options = [
        {
            "key": "conservative",
            "label": "Conservative",
            "when_to_choose": "Best if you feel flat, short on time, or want to protect the rest of the week.",
            "recommendation": conservative.to_dict(),
        },
        {
            "key": "aggressive",
            "label": "More Aggressive",
            "when_to_choose": "Best if warm-up feels smooth and you want to stay closer to the planned training stimulus.",
            "recommendation": aggressive.to_dict(),
        },
    ]
    physical = str((subjective_feedback or {}).get("physical_feeling") or "").strip().lower()
    default_key = "conservative"
    if recommendation.daily_adaptation.get("readiness_status") == "supported" and physical not in {"heavy", "sore", "injured", "sick"}:
        default_key = "aggressive"
    return options, default_key
