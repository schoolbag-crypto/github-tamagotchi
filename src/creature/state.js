import { stageForCommits, progressToNextStage, stageIndex } from "./evolution.js";
import { computeStreaks, daysSinceLastContribution, flattenCalendar } from "./streak.js";
import { computeTraits } from "./traits.js";
import { computeMood } from "./mood.js";
import {
  isShiny,
  findMilestone,
  seasonalAccessory,
  nextBondLevel,
  daysSince,
  isAdoptionAnniversary,
} from "./identity.js";

/**
 * @param {object} raw - { calendar, repos, events, username, name, now }
 * @param {object|null} previousState - last run's saved state.json, or null on first run
 */
export function buildCreatureState({ calendar, repos, events, username = "", name, now = new Date() }, previousState) {
  const days = flattenCalendar(calendar);
  const totalContributions = calendar.totalContributions;
  const { currentStreak, longestStreak } = computeStreaks(days);
  const daysSinceLastCommit = daysSinceLastContribution(days);

  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
  const totalRepos = repos.length;

  const stage = stageForCommits(totalContributions);
  const progress = progressToNextStage(totalContributions, stage.id);

  const traits = computeTraits({ events, repos, longestStreak, totalStars, totalRepos });

  // --- Identity: things that make THIS creature feel like a specific
  // individual rather than a stat readout. ---
  const shiny = isShiny(username);
  const milestone = findMilestone(totalContributions, totalStars);
  const seasonal = seasonalAccessory(now);

  const adoptedAt = previousState?.adoptedAt ?? now.toISOString();
  const daysTogether = daysSince(adoptedAt, now);
  const { bondPoints, bondLevel } = nextBondLevel(previousState?.bondPoints ?? 0);
  const recordedLongestStreak = Math.max(longestStreak, previousState?.longestStreakEver ?? 0);

  // --- Diff against previous run to detect discrete "events" ---
  // Priority matters: a level-up is the biggest deal, then fresh social
  // proof (a star), then a personal record, then a birthday, then just
  // starting a new project.
  let event = null;
  if (previousState) {
    if (stageIndex(stage.id) > stageIndex(previousState.stageId)) {
      event = "leveled_up";
    } else if (totalStars > (previousState.totalStars ?? 0)) {
      event = "new_star";
    } else if (
      currentStreak > 0 &&
      currentStreak > (previousState.longestStreakEver ?? 0) &&
      currentStreak > (previousState.currentStreak ?? 0)
    ) {
      event = "new_streak_record";
    } else if (isAdoptionAnniversary(adoptedAt, now)) {
      event = "birthday";
    } else if (totalRepos > (previousState.totalRepos ?? 0)) {
      event = "new_repo";
    }
  }

  const { mood, reason } = computeMood({ event, daysSinceLastCommit });

  return {
    stage: stage.id,
    stageLabel: stage.label,
    formName: stage.formName,
    evolveQuote: stage.evolveQuote,
    progressToNextStage: progress,
    mood,
    moodReason: reason,
    event,
    traits,
    name: name || null,
    shiny,
    milestone,
    seasonal,
    daysTogether,
    bondLevel,
    stats: {
      totalContributions,
      currentStreak,
      longestStreak,
      totalStars,
      totalRepos,
      daysSinceLastCommit,
    },
    // Persisted so next run can diff against it.
    _persist: {
      stageId: stage.id,
      totalStars,
      totalRepos,
      currentStreak,
      longestStreakEver: recordedLongestStreak,
      adoptedAt,
      bondPoints,
      updatedAt: now.toISOString(),
    },
  };
}
