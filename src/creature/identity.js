// Small pure-function helpers that give each creature a bit of individual
// identity beyond raw stats — the stuff that makes people want to check
// back and see "their" creature rather than "a" creature.

/** Tiny deterministic string hash (djb2), used so "shiny" status is stable
 * per-username instead of re-rolled every run. */
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

/** ~1-in-64 creatures are "shiny" — a rare permanent recolor. Purely
 * cosmetic, purely for the thrill of finding out. */
export function isShiny(username) {
  return hash(username) % 64 === 0;
}

/** Numbers that feel good to hit — an easy way to reward round milestones
 * without needing arbitrary new thresholds. */
export function findMilestone(totalContributions, totalStars) {
  const NICE_NUMBERS = [100, 250, 404, 500, 750, 1000, 1337, 2000, 2026, 5000, 10000];
  if (NICE_NUMBERS.includes(totalContributions)) {
    return { type: "contributions", value: totalContributions };
  }
  if (NICE_NUMBERS.includes(totalStars)) {
    return { type: "stars", value: totalStars };
  }
  return null;
}

/** Seasonal accessories keyed off the real calendar date (server time),
 * not the user's activity — a small "the world outside is real too" touch. */
export function seasonalAccessory(date = new Date()) {
  const month = date.getUTCMonth() + 1; // 1-12
  const day = date.getUTCDate();

  if (month === 10 && day >= 20) return { id: "pumpkin", label: "🎃" };
  if (month === 12 && day >= 18) return { id: "santa_hat", label: "🎅" };
  if (month === 1 && day <= 2) return { id: "party_hat", label: "🎉" };
  if (month === 10 && day === 31) return { id: "pumpkin", label: "🎃" };
  return null;
}

/**
 * Bond is a separate, always-upward meter that grows every time the
 * creature is *checked on* (i.e. the Action runs), independent of coding
 * output. It rewards keeping the ritual alive, the way an actual pet
 * relationship works — showing up matters even on quiet days.
 */
export function nextBondLevel(previousBondPoints = 0) {
  const bondPoints = previousBondPoints + 1;
  const bondLevel = Math.min(5, Math.floor(bondPoints / 10) + 1);
  return { bondPoints, bondLevel };
}

export function daysSince(isoDateString, now = new Date()) {
  const then = new Date(isoDateString);
  return Math.max(0, Math.round((now - then) / (1000 * 60 * 60 * 24)));
}

/** True if "now" falls on the same month/day as the adoption date, at
 * least a year later — the creature's little birthday. */
export function isAdoptionAnniversary(adoptedAtIso, now = new Date()) {
  const adopted = new Date(adoptedAtIso);
  const yearsPassed = now.getUTCFullYear() - adopted.getUTCFullYear();
  return (
    yearsPassed >= 1 &&
    now.getUTCMonth() === adopted.getUTCMonth() &&
    now.getUTCDate() === adopted.getUTCDate()
  );
}
