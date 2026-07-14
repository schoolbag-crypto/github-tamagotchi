import { test } from "node:test";
import assert from "node:assert/strict";
import { stageForCommits, progressToNextStage } from "../src/creature/evolution.js";
import { computeStreaks, daysSinceLastContribution } from "../src/creature/streak.js";
import { computeMood } from "../src/creature/mood.js";
import { buildCreatureState } from "../src/creature/state.js";

test("evolution thresholds", () => {
  assert.equal(stageForCommits(0).id, "baby");
  assert.equal(stageForCommits(49).id, "baby");
  assert.equal(stageForCommits(50).id, "growing");
  assert.equal(stageForCommits(199).id, "growing");
  assert.equal(stageForCommits(200).id, "advanced");
  assert.equal(stageForCommits(499).id, "advanced");
  assert.equal(stageForCommits(500).id, "legendary");
  assert.equal(stageForCommits(10000).id, "legendary");
});

test("progressToNextStage is clamped and monotonic", () => {
  assert.equal(progressToNextStage(0, "baby"), 0);
  assert.ok(progressToNextStage(25, "baby") > 0 && progressToNextStage(25, "baby") < 1);
  assert.equal(progressToNextStage(999999, "legendary"), 1); // maxed out
});

test("streak counts consecutive active days, tolerates an in-progress today", () => {
  const days = [
    { date: "2026-07-10", contributionCount: 1 },
    { date: "2026-07-11", contributionCount: 2 },
    { date: "2026-07-12", contributionCount: 0 },
    { date: "2026-07-13", contributionCount: 1 },
    { date: "2026-07-14", contributionCount: 0 }, // today, not yet committed
  ];
  const { currentStreak, longestStreak } = computeStreaks(days);
  assert.equal(currentStreak, 1); // yesterday (7/13) only
  assert.equal(longestStreak, 2); // 7/10-7/11
});

test("daysSinceLastContribution finds the most recent active day", () => {
  const days = [
    { date: "2026-07-01", contributionCount: 1 },
    { date: "2026-07-02", contributionCount: 0 },
    { date: "2026-07-03", contributionCount: 0 },
  ];
  assert.equal(daysSinceLastContribution(days), 2);
});

test("mood priority: events beat ambient inactivity signals", () => {
  assert.equal(computeMood({ event: "new_star", daysSinceLastCommit: 10 }).mood, "celebrating");
  assert.equal(computeMood({ event: "leveled_up", daysSinceLastCommit: 10 }).mood, "proud");
  assert.equal(computeMood({ event: null, daysSinceLastCommit: 10 }).mood, "sleeping");
  assert.equal(computeMood({ event: null, daysSinceLastCommit: 4 }).mood, "sleepy");
  assert.equal(computeMood({ event: null, daysSinceLastCommit: 0 }).mood, "idle");
  assert.equal(computeMood({ event: null, daysSinceLastCommit: 20 }).mood, "missing_you");
  assert.equal(computeMood({ event: null, daysSinceLastCommit: 35 }).mood, "glitch");
});

test("buildCreatureState detects a new star since the previous run", () => {
  const calendar = {
    totalContributions: 60,
    weeks: [{ contributionDays: [{ date: "2026-07-14", contributionCount: 3 }] }],
  };
  const repos = [{ name: "a", stars: 5, language: "Python", fork: false, createdAt: "", pushedAt: "" }];
  const previousState = { stageId: "growing", totalStars: 3, totalRepos: 1 };

  const state = buildCreatureState({ calendar, repos, events: [], username: "star-getter" }, previousState);
  assert.equal(state.event, "new_star");
  assert.equal(state.mood, "celebrating");
});

test("buildCreatureState works on a cold start with no previous state", () => {
  const calendar = {
    totalContributions: 10,
    weeks: [{ contributionDays: [{ date: "2026-07-14", contributionCount: 1 }] }],
  };
  const state = buildCreatureState({ calendar, repos: [], events: [], username: "newuser" }, null);
  assert.equal(state.event, null);
  assert.equal(state.stage, "baby");
  assert.equal(state.formName, "Sprout");
  // First run should adopt "now" as the adoption date.
  assert.equal(state.daysTogether, 0);
  assert.equal(state.bondLevel, 1);
});

test("buildCreatureState detects a level-up as a distinct 'leveled_up' event with a quote", () => {
  const calendar = {
    totalContributions: 60,
    weeks: [{ contributionDays: [{ date: "2026-07-14", contributionCount: 3 }] }],
  };
  const previousState = { stageId: "baby", totalStars: 0, totalRepos: 1 };
  const state = buildCreatureState({ calendar, repos: [{ name: "a", stars: 0, language: null, fork: false }], events: [], username: "grower" }, previousState);
  assert.equal(state.event, "leveled_up");
  assert.equal(state.mood, "proud");
  assert.equal(state.stage, "growing");
  assert.ok(state.evolveQuote.length > 0);
});

test("buildCreatureState carries adoptedAt and increments bond across runs", () => {
  const calendar = {
    totalContributions: 10,
    weeks: [{ contributionDays: [{ date: "2026-07-14", contributionCount: 1 }] }],
  };
  const previousState = {
    stageId: "baby", totalStars: 0, totalRepos: 0,
    adoptedAt: "2026-01-01T00:00:00.000Z", bondPoints: 9,
  };
  const now = new Date("2026-07-14T00:00:00.000Z");
  const state = buildCreatureState({ calendar, repos: [], events: [], username: "u", now }, previousState);
  assert.equal(state.daysTogether, 194);
  assert.equal(state.bondLevel, 2); // bondPoints goes 9 -> 10, floor(10/10)+1 = 2
});


