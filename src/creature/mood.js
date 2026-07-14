/**
 * Mood is picked by priority — the first matching rule wins. Discrete
 * `event`s (detected by diffing against the previous run's saved state)
 * always take priority over ambient signals like "days since last commit",
 * because a fresh reaction should never be drowned out by a slow decay.
 */
export function computeMood({ event, daysSinceLastCommit }) {
  if (event === "leveled_up") {
    return { mood: "proud", reason: "Just evolved into a new form!" };
  }
  if (event === "new_star") {
    return { mood: "celebrating", reason: "Someone starred a repo!" };
  }
  if (event === "new_repo") {
    return { mood: "celebrating", reason: "New project started!" };
  }
  if (event === "new_streak_record") {
    return { mood: "celebrating", reason: "New personal streak record!" };
  }
  if (event === "birthday") {
    return { mood: "celebrating", reason: "It's their adoption anniversary!" };
  }

  if (daysSinceLastCommit >= 30) {
    return { mood: "glitch", reason: "It's been so long the connection is fraying." };
  }
  if (daysSinceLastCommit >= 14) {
    return { mood: "missing_you", reason: "No commits in two weeks. It really misses you." };
  }
  if (daysSinceLastCommit >= 7) {
    return { mood: "sleeping", reason: "Fast asleep. No commits in over a week." };
  }
  if (daysSinceLastCommit >= 3) {
    return { mood: "sleepy", reason: "Getting drowsy — hasn't seen a commit in a few days." };
  }
  if (daysSinceLastCommit === 0) {
    return { mood: "idle", reason: "Active today!" };
  }

  return { mood: "thinking", reason: "Wondering when the next commit is coming." };
}
