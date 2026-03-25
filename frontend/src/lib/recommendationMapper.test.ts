import test from "node:test";
import assert from "node:assert/strict";

import {
  type PlannedWorkout,
  type ReadinessResult,
  type RecentTrainingContext,
  mapRecommendation,
} from "./recommendationMapper.ts";

function createReadiness(overrides: Partial<ReadinessResult> = {}): ReadinessResult {
  return {
    score: 78,
    tier: "high",
    decision: "push",
    flags: {
      reduceIntensity: false,
      reduceVolume: false,
      avoidSpeedWork: false,
      avoidHeavyLifting: false,
      forceRestOrCrossTrain: false,
      injuryOverride: false,
      mentalDownshift: false,
      highStrainCaution: false,
      elevatedHrCaution: false,
    },
    reasons: ["Recovery score is strong."],
    componentScores: {
      recovery: 18,
      sleep: 6,
      restingHr: 4,
      strain: 4,
      legs: 3,
      mental: 2,
      notes: 0,
    },
    ...overrides,
  };
}

function createContext(overrides: Partial<RecentTrainingContext> = {}): RecentTrainingContext {
  return {
    weeklyMilesCompleted: 14,
    weeklyMilesTarget: 28,
    daysSinceLastRest: 3,
    completedHardSessionsThisWeek: 1,
    completedStrengthSessionsThisWeek: 1,
    targetStrengthSessionsPerWeek: 2,
    nextKeyWorkoutInDays: 3,
    hasRaceWithinDays: null,
    ...overrides,
  };
}

function easyRunWorkout(overrides: Partial<PlannedWorkout> = {}): PlannedWorkout {
  return {
    type: "easy_run",
    plannedMiles: 3.6,
    paceRange: { min: "9:08", max: "9:29" },
    easyPaceRange: { min: "9:08", max: "9:29" },
    label: "Easy aerobic run",
    ...overrides,
  };
}

test("easy run plus high readiness stays as planned", () => {
  const result = mapRecommendation({
    readiness: createReadiness(),
    plannedWorkout: easyRunWorkout(),
    context: createContext(),
    mode: "conservative",
  });

  assert.equal(result.summaryLabel, "Easy Run");
  assert.equal(result.run.action, "run_as_planned");
  assert.equal(result.run.miles, 3.6);
  assert.deepEqual(result.run.paceRange, { min: "9:08", max: "9:29" });
});

test("tempo day gets downgraded to easy when speed work is blocked", () => {
  const result = mapRecommendation({
    readiness: createReadiness({
      score: 58,
      tier: "moderate",
      decision: "maintain",
      flags: {
        reduceIntensity: true,
        reduceVolume: false,
        avoidSpeedWork: true,
        avoidHeavyLifting: true,
        forceRestOrCrossTrain: false,
        injuryOverride: false,
        mentalDownshift: false,
        highStrainCaution: false,
        elevatedHrCaution: false,
      },
      reasons: ["Yesterday's load was elevated."],
    }),
    plannedWorkout: {
      type: "tempo",
      plannedMiles: 4.1,
      paceRange: { min: "7:20", max: "7:35" },
      easyPaceRange: { min: "9:08", max: "9:29" },
      label: "Threshold build",
      isKeySession: true,
    },
    context: createContext(),
    mode: "conservative",
  });

  assert.equal(result.summaryLabel, "Easy Run");
  assert.equal(result.run.intensity, "easy");
  assert.equal(result.run.action, "run_easy");
  assert.equal(result.planStatus, "modified");
  assert.deepEqual(result.run.paceRange, { min: "9:08", max: "9:29" });
  assert.equal(result.lift.action, "no_lift");
});

test("low readiness easy day is shortened into a recovery run", () => {
  const result = mapRecommendation({
    readiness: createReadiness({
      score: 34,
      tier: "low",
      decision: "pull_back",
      flags: {
        reduceIntensity: true,
        reduceVolume: true,
        avoidSpeedWork: true,
        avoidHeavyLifting: true,
        forceRestOrCrossTrain: false,
        injuryOverride: false,
        mentalDownshift: true,
        highStrainCaution: false,
        elevatedHrCaution: false,
      },
    }),
    plannedWorkout: easyRunWorkout({ plannedMiles: 4.0 }),
    context: createContext(),
    mode: "conservative",
  });

  assert.equal(result.summaryLabel, "Recovery Run");
  assert.equal(result.run.intensity, "very_easy");
  assert.equal(result.run.miles, 2.7);
  assert.equal(result.planStatus, "modified");
  assert.equal(result.lift.action, "no_lift");
});

test("injury override disables toggle and removes lift", () => {
  const result = mapRecommendation({
    readiness: createReadiness({
      score: 20,
      tier: "low",
      decision: "pull_back",
      flags: {
        reduceIntensity: true,
        reduceVolume: true,
        avoidSpeedWork: true,
        avoidHeavyLifting: true,
        forceRestOrCrossTrain: true,
        injuryOverride: true,
        mentalDownshift: false,
        highStrainCaution: false,
        elevatedHrCaution: false,
      },
      reasons: ["Injury-related input overrides favorable readiness signals."],
    }),
    plannedWorkout: easyRunWorkout({ plannedMiles: 4.0 }),
    context: createContext(),
    mode: "aggressive",
  });

  assert.equal(result.ui.canToggleMode, false);
  assert.equal(result.run.shouldRun, false);
  assert.equal(result.run.paceRange, null);
  assert.equal(result.lift.action, "no_lift");
  assert.equal(result.summaryLabel, "Recovery Day");
});

test("aggressive mode preserves more volume than conservative mode", () => {
  const shared = {
    readiness: createReadiness({
      score: 55,
      tier: "moderate",
      decision: "maintain",
      flags: {
        reduceIntensity: false,
        reduceVolume: true,
        avoidSpeedWork: false,
        avoidHeavyLifting: false,
        forceRestOrCrossTrain: false,
        injuryOverride: false,
        mentalDownshift: false,
        highStrainCaution: false,
        elevatedHrCaution: false,
      },
    }),
    plannedWorkout: easyRunWorkout({ plannedMiles: 4.0 }),
    context: createContext(),
  } as const;

  const conservative = mapRecommendation({ ...shared, mode: "conservative" });
  const aggressive = mapRecommendation({ ...shared, mode: "aggressive" });

  assert.ok((aggressive.run.miles ?? 0) > (conservative.run.miles ?? 0));
});

test("long run gets reduced under moderate readiness and caution flags", () => {
  const result = mapRecommendation({
    readiness: createReadiness({
      score: 52,
      tier: "moderate",
      decision: "maintain",
      flags: {
        reduceIntensity: false,
        reduceVolume: false,
        avoidSpeedWork: false,
        avoidHeavyLifting: true,
        forceRestOrCrossTrain: false,
        injuryOverride: false,
        mentalDownshift: false,
        highStrainCaution: true,
        elevatedHrCaution: false,
      },
    }),
    plannedWorkout: {
      type: "long_run",
      plannedMiles: 8.0,
      paceRange: { min: "9:05", max: "9:28" },
      easyPaceRange: { min: "9:05", max: "9:28" },
      label: "Long aerobic run",
    },
    context: createContext(),
    mode: "aggressive",
  });

  assert.equal(result.run.action, "shorten_run");
  assert.ok((result.run.miles ?? 0) < 8.0);
  assert.equal(result.planStatus, "modified");
  assert.equal(result.lift.action, "no_lift");
});

test("strength backlog allows light lift on an easy day", () => {
  const result = mapRecommendation({
    readiness: createReadiness(),
    plannedWorkout: easyRunWorkout(),
    context: createContext({
      completedStrengthSessionsThisWeek: 0,
      targetStrengthSessionsPerWeek: 2,
    }),
    mode: "aggressive",
  });

  assert.equal(result.lift.action, "lift_light");
  assert.equal(result.lift.shouldLift, true);
});

test("next key workout in one day makes recommendation more conservative", () => {
  const result = mapRecommendation({
    readiness: createReadiness({
      score: 56,
      tier: "moderate",
      decision: "maintain",
      flags: {
        reduceIntensity: false,
        reduceVolume: false,
        avoidSpeedWork: false,
        avoidHeavyLifting: true,
        forceRestOrCrossTrain: false,
        injuryOverride: false,
        mentalDownshift: false,
        highStrainCaution: true,
        elevatedHrCaution: false,
      },
    }),
    plannedWorkout: easyRunWorkout({ plannedMiles: 4.0 }),
    context: createContext({ nextKeyWorkoutInDays: 1 }),
    mode: "aggressive",
  });

  assert.equal(result.run.miles, 3.5);
  assert.match(result.reasoning.planProtection.join(" "), /protect the next key workout/i);
  assert.ok(result.reasoning.rationaleTags.includes("protect_key_session"));
});
