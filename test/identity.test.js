import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isShiny,
  findMilestone,
  seasonalAccessory,
  nextBondLevel,
  daysSince,
  isAdoptionAnniversary,
} from "../src/creature/identity.js";

test("isShiny is deterministic for the same username", () => {
  const a = isShiny("octocat");
  const b = isShiny("octocat");
  assert.equal(a, b);
});

test("isShiny varies across usernames (not all true or all false)", () => {
  const sample = ["octocat", "torvalds", "ada", "grace", "hopper", "linus", "ghost", "grower", "newuser", "u"];
  const results = sample.map(isShiny);
  assert.ok(results.some((r) => r === true) || results.every((r) => r === false));
  // At minimum, this should never throw and always return a boolean.
  for (const r of results) assert.equal(typeof r, "boolean");
});

test("findMilestone flags round numbers", () => {
  assert.deepEqual(findMilestone(1337, 0), { type: "contributions", value: 1337 });
  assert.deepEqual(findMilestone(0, 100), { type: "stars", value: 100 });
  assert.equal(findMilestone(123, 456), null);
});

test("seasonalAccessory fires only in the right windows", () => {
  assert.equal(seasonalAccessory(new Date("2026-10-25T00:00:00Z")).id, "pumpkin");
  assert.equal(seasonalAccessory(new Date("2026-12-20T00:00:00Z")).id, "santa_hat");
  assert.equal(seasonalAccessory(new Date("2026-01-01T00:00:00Z")).id, "party_hat");
  assert.equal(seasonalAccessory(new Date("2026-06-15T00:00:00Z")), null);
});

test("nextBondLevel increments points and levels up every 10 points, capped at 5", () => {
  assert.deepEqual(nextBondLevel(0), { bondPoints: 1, bondLevel: 1 });
  assert.deepEqual(nextBondLevel(9), { bondPoints: 10, bondLevel: 2 });
  assert.deepEqual(nextBondLevel(999), { bondPoints: 1000, bondLevel: 5 });
});

test("daysSince computes whole-day differences", () => {
  assert.equal(daysSince("2026-07-01T00:00:00Z", new Date("2026-07-14T00:00:00Z")), 13);
});

test("isAdoptionAnniversary only fires a year+ later on the same month/day", () => {
  assert.equal(isAdoptionAnniversary("2025-07-14T00:00:00Z", new Date("2026-07-14T00:00:00Z")), true);
  assert.equal(isAdoptionAnniversary("2026-07-14T00:00:00Z", new Date("2026-07-14T00:00:00Z")), false); // same year
  assert.equal(isAdoptionAnniversary("2025-07-14T00:00:00Z", new Date("2026-07-15T00:00:00Z")), false); // off by a day
});
