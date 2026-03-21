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
    base_payload = recommendation.to_dict()
    conservative = recommendation_from_dict(base_payload)
    aggressive = recommendation_from_dict(base_payload)
    adaptation = dict(recommendation.daily_adaptation or {})
    physical = str((subjective_feedback or {}).get("physical_feeling") or "").strip().lower()
    completed_strength = int((subjective_feedback or {}).get("weekly_strength_sessions_completed") or 0)
    strength_recently = int((subjective_feedback or {}).get("strength_sessions_last_2_days") or 0)
    strength_today = bool((subjective_feedback or {}).get("has_strength_activity_today"))
    readiness_status = str(adaptation.get("readiness_status") or "").strip().lower()
    planned_distance = aggressive.planned_run_distance_miles or aggressive.run_distance_miles
    base_distance = recommendation.run_distance_miles
    delta_cap = round(min(0.8, max(0.4, planned_distance * 0.12 if planned_distance else 0.4)), 1)
    strength_room = completed_strength < max(1, profile.desired_strength_frequency)
    allow_support_lift = strength_room and strength_recently == 0 and not strength_today and readiness_status != "not supported"
    weekly_reference = float((recommendation.weekly_intent or {}).get("mileage_target") or 0.0)
    if weekly_reference <= 0:
        weekly_reference = max(recommendation.run_distance_miles * 4.5, 20.0)
    easy_day_distance_cap = max(3.5, weekly_reference * 0.16)

    if readiness_status == "not supported":
        conservative = recommendation_from_dict(base_payload)
        aggressive = recommendation_from_dict(base_payload)
    else:
        conservative.intensity = "easy" if conservative.run_distance_miles > 0 else conservative.intensity
        if conservative.run_distance_miles > 0:
            conservative.workout = "Easy aerobic run" if conservative.workout != "Rest and recovery" else conservative.workout
            conservative.run_distance_miles = round(max(0.0, base_distance - delta_cap), 1)
            conservative.duration_minutes = max(0, int(round(conservative.run_distance_miles * 10.2))) if conservative.run_distance_miles > 0 else 0
            conservative.run_pace_guidance = str(conservative.pace_model.get("easy", {}).get("pace_range") or conservative.run_pace_guidance)
        if allow_support_lift and _intensity_rank(conservative.intensity) <= 2 and conservative.run_distance_miles <= easy_day_distance_cap:
            conservative.lift_focus = "Light durability work only"
            conservative.lift_guidance = "Add a short lift today: 2-4 controlled exercises, keep 1-2 reps in reserve, and stop if the legs feel worse after the warm-up."
        else:
            conservative.lift_focus = "Today is a lifting off-day" if conservative.run_distance_miles > 0 else "No lifting"
            conservative.lift_guidance = "Today is a lifting off-day." if conservative.run_distance_miles > 0 else "No lifting today."

        if aggressive.workout != "Rest and recovery":
            if readiness_status == "partly supported":
                aggressive_target = min(planned_distance, base_distance + delta_cap)
            else:
                aggressive_target = base_distance
            aggressive.run_distance_miles = round(max(base_distance, aggressive_target), 1)
            aggressive.duration_minutes = max(aggressive.duration_minutes, int(round(aggressive.run_distance_miles * 10)))
            planned_score = _planned_session_load_score(aggressive.planned_workout, aggressive.planned_run_distance_miles)
            base_score = _recommendation_load_score(recommendation)
            if aggressive.planned_pace_guidance and planned_score >= base_score:
                aggressive.run_pace_guidance = aggressive.planned_pace_guidance
            if aggressive.planned_workout and planned_score >= base_score:
                aggressive.workout = aggressive.planned_workout
            if aggressive.intensity in {"easy", "very easy"} and aggressive.planned_workout and planned_score >= base_score and "easy" not in aggressive.planned_workout.lower():
                aggressive.intensity = "moderate"

    if _recommendation_load_score(aggressive) < _recommendation_load_score(conservative):
        conservative, aggressive = aggressive, conservative

    conservative.daily_adaptation = {
        **adaptation,
        "adjusted_session": conservative.workout,
        "adjustment_reason": "This version protects durability, keeps the weekly goal alive, and leaves more room for the body to come around later.",
        "weekly_goal_remains": adaptation.get("weekly_goal_remains") or f"Preserve the week's primary focus on {recommendation.weekly_intent.get('primary_adaptation', 'the current adaptation')}.",
        "reschedule_suggestion": _reschedule_guidance(
            WeeklyIntent(**recommendation.weekly_intent) if recommendation.weekly_intent else build_weekly_intent(profile, [], [], today=parse_date(recommendation.date)),
            readiness_status or "partly supported",
        ) if recommendation.weekly_intent else adaptation.get("reschedule_suggestion", ""),
    }
    aggressive.daily_adaptation = {
        **adaptation,
        "adjusted_session": aggressive.workout,
        "adjustment_reason": "This version stays very close to the base recommendation and only nudges back toward the original plan if warm-up improves.",
        "weekly_goal_remains": adaptation.get("weekly_goal_remains") or f"Preserve the week's primary focus on {recommendation.weekly_intent.get('primary_adaptation', 'the current adaptation')}.",
        "reschedule_suggestion": adaptation.get("reschedule_suggestion") or "Use this only if the first 10-15 minutes feel clearly better than expected.",
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

    default_key = "conservative" if recommendation.confidence != "high" or physical in {"heavy", "sore", "injured", "sick"} else "aggressive"
    return options, default_key
