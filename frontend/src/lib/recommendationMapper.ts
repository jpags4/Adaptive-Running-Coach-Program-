export type ReadinessTier = "high" | "moderate" | "low";
export type TrainingDecision = "push" | "maintain" | "pull_back";

export interface ReadinessFlags {
  reduceIntensity: boolean;
  reduceVolume: boolean;
  avoidSpeedWork: boolean;
  avoidHeavyLifting: boolean;
  forceRestOrCrossTrain: boolean;
  injuryOverride: boolean;
  mentalDownshift: boolean;
  highStrainCaution: boolean;
  elevatedHrCaution: boolean;
}

export interface ReadinessResult {
  score: number;
  tier: ReadinessTier;
  decision: TrainingDecision;
  flags: ReadinessFlags;
  reasons: string[];
  componentScores: {
    recovery: number;
    sleep: number;
    restingHr: number;
    strain: number;
    legs: number;
    mental: number;
    notes: number;
  };
}

export type PlannedWorkoutType =
  | "rest"
  | "easy_run"
  | "long_run"
  | "tempo"
  | "intervals"
  | "race_pace"
  | "cross_train"
  | "strength_only";

export interface PaceRange {
  min: string;
  max: string;
}

export interface PlannedWorkout {
  type: PlannedWorkoutType;
  plannedMiles?: number | null;
  plannedDurationMin?: number | null;
  plannedPaceMinPerMile?: number | null;
  paceRange?: PaceRange | null;
  easyPaceRange?: PaceRange | null;
  label: string;
  isKeySession?: boolean;
}

export interface RecentTrainingContext {
  weeklyMilesCompleted: number | null;
  weeklyMilesTarget: number | null;
  daysSinceLastRest?: number | null;
  completedHardSessionsThisWeek?: number | null;
  completedStrengthSessionsThisWeek?: number | null;
  targetStrengthSessionsPerWeek?: number | null;
  nextKeyWorkoutInDays?: number | null;
  hasRaceWithinDays?: number | null;
}

export type RecommendationMode = "conservative" | "aggressive";

export interface RecommendationMapperInputs {
  readiness: ReadinessResult;
  plannedWorkout: PlannedWorkout;
  context: RecentTrainingContext;
  mode: RecommendationMode;
}

export type RunAction =
  | "run_as_planned"
  | "run_easy"
  | "shorten_run"
  | "replace_with_recovery_run"
  | "replace_with_walk_or_cross_train"
  | "rest";

export type LiftAction =
  | "lift_as_planned"
  | "lift_light"
  | "core_only"
  | "mobility_only"
  | "no_lift";

export interface RunRecommendation {
  action: RunAction;
  label: string;
  miles: number | null;
  durationMin: number | null;
  paceRange: PaceRange | null;
  intensity: "rest" | "very_easy" | "easy" | "moderate" | "hard";
  shouldRun: boolean;
}

export interface LiftRecommendation {
  action: LiftAction;
  label: string;
  shouldLift: boolean;
  guidance: string[];
}

export interface RecommendationReasoning {
  overall: string;
  runLogic: string[];
  liftLogic: string[];
  recoveryInfluence: string[];
  planProtection: string[];
  rationaleTags: string[];
}

export type PlanStatus = "preserved" | "modified" | "replaced";

export interface DailyRecommendation {
  readinessScore: number;
  readinessTier: ReadinessTier;
  decision: TrainingDecision;
  mode: RecommendationMode;
  planStatus: PlanStatus;
  planStatusLabel: string;
  summaryLabel: string;
  run: RunRecommendation;
  lift: LiftRecommendation;
  reasoning: RecommendationReasoning;
  ui: {
    primaryBadge: string;
    secondaryBadge: string;
    canToggleMode: boolean;
  };
}

interface MappingState {
  run: RunRecommendation;
  runLogic: string[];
  liftLogic: string[];
  planProtection: string[];
  tags: Set<string>;
  lift?: LiftRecommendation;
}

const MIN_RECOVERY_RUN_MILES = 2.0;
const MIN_MOVEMENT_MINUTES = 20;

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function copyPaceRange(paceRange?: PaceRange | null): PaceRange | null {
  return paceRange ? { min: paceRange.min, max: paceRange.max } : null;
}

function parsePaceToSeconds(value: string): number | null {
  const match = String(value || "").trim().match(/^(\d+):(\d{2})$/);
  if (!match) {
    return null;
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatSecondsToPace(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function isQualityWorkout(type: PlannedWorkoutType): boolean {
  return type === "tempo" || type === "intervals" || type === "race_pace";
}

function isEasyLikeWorkout(type: PlannedWorkoutType): boolean {
  return type === "easy_run" || type === "long_run";
}

function intensityRank(intensity: RunRecommendation["intensity"]): number {
  switch (intensity) {
    case "hard":
      return 4;
    case "moderate":
      return 3;
    case "easy":
      return 2;
    case "very_easy":
      return 1;
    default:
      return 0;
  }
}

function rankToIntensity(rank: number): RunRecommendation["intensity"] {
  if (rank >= 4) {
    return "hard";
  }
  if (rank === 3) {
    return "moderate";
  }
  if (rank === 2) {
    return "easy";
  }
  if (rank === 1) {
    return "very_easy";
  }
  return "rest";
}

function supportsStrengthWork(context: RecentTrainingContext): boolean {
  return (
    context.completedStrengthSessionsThisWeek != null &&
    context.targetStrengthSessionsPerWeek != null &&
    context.completedStrengthSessionsThisWeek < context.targetStrengthSessionsPerWeek
  );
}

function multipleCautionFlags(readiness: ReadinessResult): boolean {
  const { flags } = readiness;
  return [flags.highStrainCaution, flags.elevatedHrCaution, flags.mentalDownshift].filter(Boolean).length >= 2;
}

function capToWeeklyRemaining(miles: number | null, context: RecentTrainingContext): number | null {
  if (miles == null) {
    return null;
  }
  if (context.weeklyMilesCompleted == null || context.weeklyMilesTarget == null) {
    return miles;
  }
  const remaining = roundToTenth(context.weeklyMilesTarget - context.weeklyMilesCompleted);
  if (remaining <= 0) {
    return miles;
  }
  return roundToTenth(Math.min(miles, remaining + 0.5));
}

function deriveDuration(run: RunRecommendation): number | null {
  if (run.durationMin != null) {
    return Math.round(run.durationMin);
  }
  if (run.miles == null) {
    return null;
  }
  const minutesPerMile =
    run.intensity === "hard"
      ? 8.5
      : run.intensity === "moderate"
        ? 9.5
        : run.intensity === "easy"
          ? 10.5
          : 11.5;
  return Math.max(MIN_MOVEMENT_MINUTES, Math.round(run.miles * minutesPerMile));
}

function sameNumber(left: number | null | undefined, right: number | null | undefined): boolean {
  if (left == null || right == null) {
    return left == null && right == null;
  }
  return Math.abs(left - right) < 0.05;
}

function samePaceRange(left: PaceRange | null | undefined, right: PaceRange | null | undefined): boolean {
  if (!left || !right) {
    return !left && !right;
  }
  return left.min === right.min && left.max === right.max;
}

function getPlanStatusLabel(status: PlanStatus): string {
  if (status === "preserved") {
    return "As Planned";
  }
  if (status === "modified") {
    return "Adjusted";
  }
  return "Changed";
}

function determinePlanStatus(
  plannedWorkout: PlannedWorkout,
  baselineRun: RunRecommendation,
  finalRun: RunRecommendation,
  lift: LiftRecommendation,
): PlanStatus {
  if (plannedWorkout.type === "strength_only") {
    if (lift.action === "lift_as_planned") {
      return "preserved";
    }
    if (lift.action === "no_lift") {
      return "replaced";
    }
    return "modified";
  }

  if (plannedWorkout.type === "rest") {
    return finalRun.action === "rest" && !finalRun.shouldRun && !lift.shouldLift ? "preserved" : "replaced";
  }

  if (plannedWorkout.type === "cross_train") {
    if (finalRun.action === "replace_with_walk_or_cross_train" && !finalRun.shouldRun) {
      return sameNumber(finalRun.durationMin, baselineRun.durationMin) ? "preserved" : "modified";
    }
    return "replaced";
  }

  if (!finalRun.shouldRun || finalRun.action === "replace_with_walk_or_cross_train" || finalRun.action === "rest") {
    return "replaced";
  }

  const preserved =
    finalRun.action === baselineRun.action &&
    finalRun.label === baselineRun.label &&
    finalRun.intensity === baselineRun.intensity &&
    finalRun.shouldRun === baselineRun.shouldRun &&
    sameNumber(finalRun.miles, baselineRun.miles) &&
    sameNumber(finalRun.durationMin, baselineRun.durationMin) &&
    samePaceRange(finalRun.paceRange, baselineRun.paceRange);

  return preserved ? "preserved" : "modified";
}

export function adjustVolume(base: number | null | undefined, percent: number): number | null {
  if (base == null) {
    return null;
  }
  return roundToTenth(base * (1 + percent / 100));
}

export function getAdjustedPaceRange(
  plannedWorkout: PlannedWorkout,
  targetIntensity: RunRecommendation["intensity"],
): PaceRange | null {
  if (targetIntensity === "rest") {
    return null;
  }

  if ((targetIntensity === "easy" || targetIntensity === "very_easy") && plannedWorkout.easyPaceRange) {
    return copyPaceRange(plannedWorkout.easyPaceRange);
  }

  const current = plannedWorkout.paceRange;
  if (!current) {
    return null;
  }

  if (targetIntensity === "hard" || targetIntensity === "moderate") {
    return copyPaceRange(current);
  }

  const minSeconds = parsePaceToSeconds(current.min);
  const maxSeconds = parsePaceToSeconds(current.max);
  if (minSeconds == null || maxSeconds == null) {
    return null;
  }

  const shift = targetIntensity === "easy" ? 45 : 75;
  return {
    min: formatSecondsToPace(minSeconds + shift),
    max: formatSecondsToPace(maxSeconds + shift),
  };
}

export function createBaselineRunRecommendation(plannedWorkout: PlannedWorkout): RunRecommendation {
  const miles = plannedWorkout.plannedMiles ?? null;
  const durationMin = plannedWorkout.plannedDurationMin ?? null;

  switch (plannedWorkout.type) {
    case "rest":
      return {
        action: "rest",
        label: "Rest Day",
        miles: null,
        durationMin: null,
        paceRange: null,
        intensity: "rest",
        shouldRun: false,
      };
    case "easy_run":
      return {
        action: "run_as_planned",
        label: "Easy Run",
        miles,
        durationMin,
        paceRange: copyPaceRange(plannedWorkout.paceRange ?? plannedWorkout.easyPaceRange),
        intensity: "easy",
        shouldRun: true,
      };
    case "long_run":
      return {
        action: "run_as_planned",
        label: "Long Run",
        miles,
        durationMin,
        paceRange: copyPaceRange(plannedWorkout.paceRange ?? plannedWorkout.easyPaceRange),
        intensity: "easy",
        shouldRun: true,
      };
    case "tempo":
      return {
        action: "run_as_planned",
        label: "Tempo Run",
        miles,
        durationMin,
        paceRange: copyPaceRange(plannedWorkout.paceRange),
        intensity: "hard",
        shouldRun: true,
      };
    case "intervals":
      return {
        action: "run_as_planned",
        label: "Intervals",
        miles,
        durationMin,
        paceRange: copyPaceRange(plannedWorkout.paceRange),
        intensity: "hard",
        shouldRun: true,
      };
    case "race_pace":
      return {
        action: "run_as_planned",
        label: "Race Pace Run",
        miles,
        durationMin,
        paceRange: copyPaceRange(plannedWorkout.paceRange),
        intensity: "hard",
        shouldRun: true,
      };
    case "cross_train":
      return {
        action: "replace_with_walk_or_cross_train",
        label: "Cross-Train",
        miles: null,
        durationMin: durationMin ?? MIN_MOVEMENT_MINUTES,
        paceRange: null,
        intensity: "very_easy",
        shouldRun: false,
      };
    case "strength_only":
      return {
        action: "rest",
        label: "No Run Scheduled",
        miles: null,
        durationMin: null,
        paceRange: null,
        intensity: "rest",
        shouldRun: false,
      };
  }
}

function createNoLift(guidance: string[]): LiftRecommendation {
  return {
    action: "no_lift",
    label: "No lift today",
    shouldLift: false,
    guidance,
  };
}

function createCoreOnly(): LiftRecommendation {
  return {
    action: "core_only",
    label: "Core only",
    shouldLift: true,
    guidance: ["Keep the session short and low load.", "Use core, hips, and glute activation only."],
  };
}

function createMobilityOnly(): LiftRecommendation {
  return {
    action: "mobility_only",
    label: "Mobility only",
    shouldLift: true,
    guidance: ["Keep the session gentle and under 20 minutes.", "Use mobility, soft tissue, or easy activation only."],
  };
}

function applyRunPatch(state: MappingState, patch: Partial<RunRecommendation>, logic?: string, tag?: string): void {
  state.run = { ...state.run, ...patch };
  if (logic) {
    state.runLogic.push(logic);
  }
  if (tag) {
    state.tags.add(tag);
  }
}

export function applyReadinessAdjustments(state: MappingState, inputs: RecommendationMapperInputs): MappingState {
  const { readiness, plannedWorkout, mode } = inputs;

  if (readiness.flags.injuryOverride || readiness.flags.forceRestOrCrossTrain) {
    state.run = {
      action: "replace_with_walk_or_cross_train",
      label: "Recovery / Cross-Train",
      miles: null,
      durationMin: MIN_MOVEMENT_MINUTES,
      paceRange: null,
      intensity: "very_easy",
      shouldRun: false,
    };
    state.runLogic.push("Safety flags override the planned session and remove training stress.");
    state.tags.add("injury_override");
    state.tags.add("replace_with_cross_train");
    return state;
  }

  if (readiness.decision === "push") {
    if (plannedWorkout.type === "rest") {
      state.runLogic.push("Readiness is high, but the planned rest day stays in place by default.");
    }
    return state;
  }

  if (readiness.decision === "maintain") {
    if (isQualityWorkout(plannedWorkout.type) && (readiness.flags.avoidSpeedWork || readiness.flags.reduceIntensity)) {
      applyRunPatch(
        state,
        { action: "run_easy", label: "Easy Run", intensity: "easy", shouldRun: true },
        "Preserved movement but removed workout intensity.",
        "downshift_intensity",
      );
    }

    if (plannedWorkout.type === "easy_run" && readiness.flags.reduceIntensity) {
      applyRunPatch(
        state,
        { action: "replace_with_recovery_run", label: "Recovery Run", intensity: "very_easy" },
        "Lowered the easy run to recovery effort because readiness is not fully supportive.",
        "downshift_intensity",
      );
    }

    if (plannedWorkout.type === "long_run" && (readiness.flags.reduceIntensity || readiness.flags.reduceVolume || readiness.flags.highStrainCaution)) {
      applyRunPatch(
        state,
        { action: "shorten_run", label: "Easy Long Run", intensity: "easy" },
        "Kept the aerobic structure but trimmed the long run stress.",
        "reduce_volume",
      );
    }

    return state;
  }

  if (plannedWorkout.type === "rest") {
    state.runLogic.push("The planned rest day remains in place because readiness is low.");
    return state;
  }

  if (isQualityWorkout(plannedWorkout.type)) {
    if (multipleCautionFlags(readiness)) {
      applyRunPatch(
        state,
        {
          action: "replace_with_walk_or_cross_train",
          label: "Pull Back Day",
          miles: null,
          durationMin: MIN_MOVEMENT_MINUTES,
          paceRange: null,
          intensity: "very_easy",
          shouldRun: false,
        },
        "Removed quality work entirely because low readiness and caution flags make it too costly.",
        "replace_quality_session",
      );
    } else {
      applyRunPatch(
        state,
        {
          action: "replace_with_recovery_run",
          label: mode === "aggressive" ? "Easy Run" : "Recovery Run",
          intensity: mode === "aggressive" ? "easy" : "very_easy",
          shouldRun: true,
        },
        "Replaced the quality session with low-stress aerobic work.",
        "replace_quality_session",
      );
    }
    state.tags.add("downshift_intensity");
    return state;
  }

  if (plannedWorkout.type === "long_run") {
    applyRunPatch(
      state,
      {
        action: "shorten_run",
        label: mode === "aggressive" ? "Easy Run" : "Recovery Run",
        intensity: mode === "aggressive" ? "easy" : "very_easy",
        shouldRun: true,
      },
      "Low readiness removes the full long-run load and keeps only manageable aerobic work.",
      "reduce_volume",
    );
    return state;
  }

  if (plannedWorkout.type === "easy_run") {
    if (multipleCautionFlags(readiness)) {
      applyRunPatch(
        state,
        {
          action: "replace_with_walk_or_cross_train",
          label: "Pull Back Day",
          miles: null,
          durationMin: MIN_MOVEMENT_MINUTES,
          paceRange: null,
          intensity: "very_easy",
          shouldRun: false,
        },
        "The easy run was removed because multiple caution flags suggest recovery is the better use of today.",
        "pull_back_day",
      );
    } else {
      applyRunPatch(
        state,
        {
          action: "replace_with_recovery_run",
          label: "Recovery Run",
          intensity: mode === "aggressive" ? "easy" : "very_easy",
          shouldRun: true,
        },
        "The easy run stays in place but shifts toward recovery work.",
        "downshift_intensity",
      );
    }
  }

  return state;
}

export function applyVolumeAdjustments(state: MappingState, inputs: RecommendationMapperInputs): MappingState {
  const { readiness, plannedWorkout, context, mode } = inputs;

  if (!state.run.shouldRun) {
    state.run.durationMin = state.run.durationMin ?? MIN_MOVEMENT_MINUTES;
    return state;
  }

  let percent = 0;
  if (readiness.decision === "maintain" && readiness.flags.reduceVolume) {
    percent = mode === "aggressive" ? -10 : -15;
  } else if (readiness.decision === "maintain" && plannedWorkout.type === "long_run" && readiness.flags.highStrainCaution) {
    percent = mode === "aggressive" ? -8 : -12;
  } else if (readiness.decision === "pull_back" && readiness.flags.reduceVolume) {
    percent = mode === "aggressive" ? -22 : -32;
  } else if (readiness.decision === "pull_back") {
    percent = mode === "aggressive" ? -15 : -25;
  } else if (readiness.decision === "push" && mode === "aggressive" && isEasyLikeWorkout(plannedWorkout.type)) {
    const roomRemaining =
      context.weeklyMilesCompleted != null && context.weeklyMilesTarget != null
        ? context.weeklyMilesTarget - context.weeklyMilesCompleted > 0
        : true;
    if (!readiness.flags.highStrainCaution && !readiness.flags.elevatedHrCaution && roomRemaining) {
      percent = plannedWorkout.type === "long_run" ? 5 : 8;
    }
  }

  if (state.run.miles != null) {
    let adjustedMiles = adjustVolume(state.run.miles, percent);
    if (state.run.action === "replace_with_recovery_run" || state.run.action === "shorten_run") {
      adjustedMiles = Math.max(MIN_RECOVERY_RUN_MILES, adjustedMiles ?? MIN_RECOVERY_RUN_MILES);
    }
    state.run.miles = capToWeeklyRemaining(adjustedMiles, context);
  }

  if (state.run.durationMin != null) {
    let adjustedDuration = Math.round(state.run.durationMin * (100 + percent) / 100);
    if (state.run.action === "replace_with_recovery_run" || state.run.action === "shorten_run") {
      adjustedDuration = Math.max(MIN_MOVEMENT_MINUTES, adjustedDuration);
    }
    state.run.durationMin = adjustedDuration;
  }

  if (percent < 0) {
    state.runLogic.push("Reduced volume to match current recovery capacity.");
    state.tags.add("reduce_volume");
  }
  if (percent > 0) {
    state.runLogic.push("Added a small amount of volume because readiness is high and the planned day is low risk.");
    state.tags.add("preserve_planned_volume");
  }

  state.run.durationMin = deriveDuration(state.run);
  return state;
}

export function applyPaceAdjustments(state: MappingState, inputs: RecommendationMapperInputs): MappingState {
  if (!state.run.shouldRun) {
    state.run.paceRange = null;
    return state;
  }

  state.run.paceRange = getAdjustedPaceRange(inputs.plannedWorkout, state.run.intensity);

  if (!state.run.paceRange) {
    state.runLogic.push("No pace range is enforced here, so the recommendation should be executed by feel and duration.");
    state.tags.add("duration_first_guidance");
    return state;
  }

  const baselineIntensity = createBaselineRunRecommendation(inputs.plannedWorkout).intensity;
  if (state.run.intensity !== baselineIntensity) {
    state.runLogic.push("Used easier pace guidance to match the downshifted intensity.");
    state.tags.add("easy_pace_substitution");
  }

  return state;
}

export function applyPlanProtection(state: MappingState, inputs: RecommendationMapperInputs): MappingState {
  const { readiness, plannedWorkout, context } = inputs;
  const soonKey = context.nextKeyWorkoutInDays != null && context.nextKeyWorkoutInDays <= 2;
  const compromised = readiness.decision !== "push" || readiness.flags.highStrainCaution || readiness.flags.elevatedHrCaution;

  if (soonKey && compromised) {
    state.planProtection.push("Kept today lighter to protect the next key workout.");
    state.tags.add("protect_key_session");

    if (state.run.shouldRun && state.run.intensity !== "rest") {
      if (intensityRank(state.run.intensity) >= intensityRank("moderate")) {
        state.run.intensity = "easy";
        state.run.action = "run_easy";
        state.run.label = "Easy Run";
      }
      if (state.run.miles != null) {
        state.run.miles = roundToTenth(Math.max(MIN_RECOVERY_RUN_MILES, state.run.miles - 0.5));
        state.run.durationMin = deriveDuration(state.run);
      }
    }
  }

  if (plannedWorkout.isKeySession && readiness.decision !== "push") {
    state.planProtection.push("Protected the rest of the week by removing pressure from today's key session.");
    state.tags.add("protect_week_structure");
  }

  if (context.hasRaceWithinDays != null && context.hasRaceWithinDays <= 7 && state.run.shouldRun) {
    state.planProtection.push("A nearby race keeps today's recommendation conservative.");
    state.tags.add("race_week_caution");
    if (state.run.intensity === "hard") {
      state.run.intensity = "easy";
      state.run.action = "run_easy";
      state.run.label = "Easy Run";
    }
  }

  return state;
}

export function mapLiftRecommendation(inputs: RecommendationMapperInputs, run: RunRecommendation): LiftRecommendation {
  const { readiness, plannedWorkout, context, mode } = inputs;
  const originallyHighStressDay = isQualityWorkout(plannedWorkout.type) || plannedWorkout.type === "long_run";
  const strengthBacklog = supportsStrengthWork(context);

  if (readiness.flags.injuryOverride || readiness.flags.forceRestOrCrossTrain) {
    return createNoLift(["Prioritize recovery and reassess tomorrow."]);
  }

  if (plannedWorkout.type === "strength_only") {
    if (readiness.decision === "push") {
      return {
        action: "lift_as_planned",
        label: "Strength as planned",
        shouldLift: true,
        guidance: ["Keep the lift technically clean and stop short of grinding reps."],
      };
    }
    if (readiness.decision === "maintain") {
      return {
        action: "lift_light",
        label: "Light strength",
        shouldLift: true,
        guidance: ["Keep total lift under 20 minutes.", "No heavy lower-body loading today."],
      };
    }
    return mode === "aggressive" ? createCoreOnly() : createMobilityOnly();
  }

  if (readiness.decision === "pull_back") {
    if (mode === "aggressive" && strengthBacklog && !readiness.flags.avoidHeavyLifting) {
      return createCoreOnly();
    }
    return createNoLift(["Skip lifting so recovery can be the main training objective today."]);
  }

  if (readiness.flags.avoidHeavyLifting && originallyHighStressDay) {
    return createNoLift(["Skip lifting so the reduced run still has room to absorb and recover."]);
  }

  if (run.intensity === "hard") {
    if (readiness.flags.avoidHeavyLifting) {
      return createNoLift(["Heavy lifting is removed because the run already carries the day's training stress."]);
    }
    return {
      action: "lift_light",
      label: "Light strength",
      shouldLift: true,
      guidance: ["Keep total lift under 20 minutes.", "Use upper body, trunk, or light accessory work only."],
    };
  }

  if ((run.intensity === "easy" || run.intensity === "very_easy") && readiness.tier !== "low") {
    if (strengthBacklog && mode === "aggressive") {
      return {
        action: "lift_light",
        label: "Light strength",
        shouldLift: true,
        guidance: [
          "Keep total lift under 20 minutes.",
          "No heavy squats or loaded single-leg work.",
          "Use bodyweight or light dumbbells only.",
        ],
      };
    }
    if (strengthBacklog && mode === "conservative" && plannedWorkout.type !== "rest") {
      return createCoreOnly();
    }
  }

  if (plannedWorkout.type === "rest" && readiness.decision === "push" && mode === "aggressive" && strengthBacklog) {
    return createCoreOnly();
  }

  return createNoLift(["No extra lifting is needed to get the intended benefit from today."]);
}

export function applyModeAdjustments(state: MappingState, inputs: RecommendationMapperInputs): MappingState {
  if (inputs.readiness.flags.injuryOverride || inputs.readiness.flags.forceRestOrCrossTrain) {
    return state;
  }

  if (inputs.mode === "conservative") {
    if (state.run.shouldRun && state.run.intensity === "easy" && inputs.readiness.decision !== "push") {
      state.run.paceRange = getAdjustedPaceRange(
        { ...inputs.plannedWorkout, paceRange: state.run.paceRange ?? undefined },
        "very_easy",
      ) ?? state.run.paceRange;
    }
    return state;
  }

  if (state.run.shouldRun && inputs.readiness.decision === "pull_back" && state.run.intensity === "very_easy") {
    state.run.intensity = "easy";
    state.run.label = "Easy Run";
    state.run.paceRange = getAdjustedPaceRange(inputs.plannedWorkout, "easy");
    state.runLogic.push("Aggressive mode keeps a little more forward motion while still respecting safety limits.");
  }

  return state;
}

export function buildSummaryLabel(
  run: RunRecommendation,
  lift: LiftRecommendation,
  plannedWorkout: PlannedWorkout,
): string {
  if (run.shouldRun) {
    if (run.intensity === "very_easy") {
      return "Recovery Run";
    }
    if (run.intensity === "easy") {
      return "Easy Run";
    }
    if (plannedWorkout.type === "long_run" && run.action === "run_as_planned") {
      return "Long Run";
    }
    return run.label;
  }

  if (!run.shouldRun && !lift.shouldLift) {
    return run.action === "rest" ? "Rest Day" : "Recovery Day";
  }

  if (!run.shouldRun && lift.action === "mobility_only") {
    return "Mobility Day";
  }

  if (!run.shouldRun && lift.action === "core_only") {
    return "Light Strength Day";
  }

  return "Pull Back Day";
}

function buildRecoveryInfluence(readiness: ReadinessResult): string[] {
  const entries: string[] = [];
  if (readiness.componentScores.recovery < 0) {
    entries.push("Recovery score below threshold triggered a downshift.");
  }
  if (readiness.flags.elevatedHrCaution) {
    entries.push("Elevated resting HR added caution.");
  }
  if (readiness.flags.highStrainCaution) {
    entries.push("High recent strain limited how much load to keep today.");
  }
  if (readiness.componentScores.legs < 0) {
    entries.push("Subjective leg feedback materially lowered readiness.");
  }
  if (readiness.flags.mentalDownshift) {
    entries.push("Mental fatigue reduced the ceiling for today's training.");
  }
  return entries;
}

export function buildReasoning(
  state: MappingState,
  planStatus: PlanStatus,
): RecommendationReasoning {
  let overall = "The planned session has been adjusted based on readiness and recovery signals. We preserve structure while reducing stress.";
  if (planStatus === "preserved") {
    overall = "The planned session is supported today. Readiness is high and no caution flags are present, so we keep the workout unchanged.";
  } else if (planStatus === "replaced") {
    overall = "The planned session has been replaced due to recovery and risk signals. The priority is protecting the athlete and the rest of the week.";
  }

  return {
    overall,
    runLogic: state.runLogic,
    liftLogic: state.liftLogic,
    recoveryInfluence: [],
    planProtection: state.planProtection,
    rationaleTags: Array.from(state.tags),
  };
}

export function mapRecommendation(inputs: RecommendationMapperInputs): DailyRecommendation {
  const baselineRun = createBaselineRunRecommendation(inputs.plannedWorkout);
  const state: MappingState = {
    run: baselineRun,
    runLogic: [],
    liftLogic: [],
    planProtection: [],
    tags: new Set<string>(),
  };

  applyReadinessAdjustments(state, inputs);
  applyVolumeAdjustments(state, inputs);
  applyPlanProtection(state, inputs);
  applyPaceAdjustments(state, inputs);
  state.lift = mapLiftRecommendation(inputs, state.run);
  applyModeAdjustments(state, inputs);

  if (!state.lift) {
    state.lift = createNoLift(["No extra lifting is needed to get the intended benefit from today."]);
  }

  if (state.lift.action === "no_lift") {
    state.liftLogic.push("No lift today because recovery is more important than adding extra training load.");
    state.tags.add("no_lift");
  } else if (state.lift.action === "lift_light") {
    state.liftLogic.push("Light strength is allowed because run intensity is controlled and total stress stays capped.");
    state.tags.add("light_lift_allowed");
  } else if (state.lift.action === "core_only") {
    state.liftLogic.push("Only trunk and light activation work are allowed so strength work stays restorative.");
    state.tags.add("core_only");
  } else if (state.lift.action === "mobility_only") {
    state.liftLogic.push("Mobility replaces strength loading because readiness does not support more stress.");
    state.tags.add("mobility_only");
  } else {
    state.liftLogic.push("Strength can stay on the plan because readiness supports it.");
    state.tags.add("lift_as_planned");
  }

  if (inputs.readiness.flags.avoidSpeedWork) {
    state.tags.add("avoid_speed_work");
  }
  if (inputs.readiness.flags.mentalDownshift) {
    state.tags.add("subjective_fatigue");
  }
  if (inputs.readiness.flags.highStrainCaution) {
    state.tags.add("high_strain_caution");
  }
  if (inputs.readiness.flags.elevatedHrCaution) {
    state.tags.add("elevated_hr_caution");
  }

  if (state.run.miles != null) {
    state.run.miles = roundToTenth(clamp(state.run.miles, 0, 100));
  }

  const summaryLabel = buildSummaryLabel(state.run, state.lift, inputs.plannedWorkout);
  const planStatus = determinePlanStatus(inputs.plannedWorkout, baselineRun, state.run, state.lift);
  const planStatusLabel = getPlanStatusLabel(planStatus);
  const reasoning = {
    ...buildReasoning(state, planStatus),
    recoveryInfluence: buildRecoveryInfluence(inputs.readiness),
  };

  return {
    readinessScore: inputs.readiness.score,
    readinessTier: inputs.readiness.tier,
    decision: inputs.readiness.decision,
    mode: inputs.mode,
    planStatus,
    planStatusLabel,
    summaryLabel,
    run: state.run,
    lift: state.lift,
    reasoning,
    ui: {
      primaryBadge: summaryLabel,
      secondaryBadge: inputs.mode === "conservative" ? "Conservative" : "Aggressive",
      canToggleMode: !(inputs.readiness.flags.injuryOverride || inputs.readiness.flags.forceRestOrCrossTrain),
    },
  };
}
