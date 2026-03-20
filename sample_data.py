from coach import AthleteProfile, RecoveryMetrics, Run


SAMPLE_PROFILE = AthleteProfile(
    name="Jordan",
    goal_race_date="2026-05-10",
    weekly_mileage_target=28,
    preferred_long_run_day="Sunday",
)

SAMPLE_RUNS = [
    Run(day="2026-03-08", distance_miles=10.2, duration_minutes=92, effort="moderate", workout_type="long_run"),
    Run(day="2026-03-10", distance_miles=4.0, duration_minutes=36, effort="easy", workout_type="easy"),
    Run(day="2026-03-11", distance_miles=6.2, duration_minutes=49, effort="hard", workout_type="tempo"),
    Run(day="2026-03-13", distance_miles=5.1, duration_minutes=44, effort="easy", workout_type="easy"),
]

SAMPLE_METRICS = [
    RecoveryMetrics(day="2026-03-08", recovery_score=72, sleep_hours=7.8, resting_hr=49, hrv_ms=78, strain=14.1),
    RecoveryMetrics(day="2026-03-09", recovery_score=58, sleep_hours=6.6, resting_hr=51, hrv_ms=70, strain=8.5),
    RecoveryMetrics(day="2026-03-10", recovery_score=74, sleep_hours=7.5, resting_hr=49, hrv_ms=82, strain=10.4),
    RecoveryMetrics(day="2026-03-11", recovery_score=83, sleep_hours=8.0, resting_hr=48, hrv_ms=88, strain=12.9),
    RecoveryMetrics(day="2026-03-12", recovery_score=46, sleep_hours=6.1, resting_hr=53, hrv_ms=62, strain=15.6),
    RecoveryMetrics(day="2026-03-13", recovery_score=64, sleep_hours=7.0, resting_hr=50, hrv_ms=76, strain=11.2),
    RecoveryMetrics(day="2026-03-14", recovery_score=81, sleep_hours=8.2, resting_hr=48, hrv_ms=91, strain=9.8),
]
