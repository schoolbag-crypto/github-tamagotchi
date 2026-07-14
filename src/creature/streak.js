/**
 * Given a flat array of { date: 'YYYY-MM-DD', contributionCount } sorted
 * ascending, compute current streak (consecutive days up to today/yesterday)
 * and the longest streak in the window.
 */
export function computeStreaks(days) {
  let longest = 0;
  let running = 0;
  let current = 0;

  for (let i = 0; i < days.length; i++) {
    if (days[i].contributionCount > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  // Current streak: walk backwards from the last day while contributions > 0.
  // Allow "today" to be empty (still working on it) without breaking the streak,
  // as long as yesterday had activity.
  for (let i = days.length - 1; i >= 0; i--) {
    const isLastDay = i === days.length - 1;
    if (days[i].contributionCount > 0) {
      current += 1;
    } else if (isLastDay) {
      continue; // today can be zero so far, don't break the streak yet
    } else {
      break;
    }
  }

  return { currentStreak: current, longestStreak: longest };
}

export function daysSinceLastContribution(days) {
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) {
      const last = new Date(days[i].date + "T00:00:00Z");
      const today = new Date(days[days.length - 1].date + "T00:00:00Z");
      return Math.round((today - last) / (1000 * 60 * 60 * 24));
    }
  }
  return Infinity;
}

export function flattenCalendar(calendar) {
  return calendar.weeks.flatMap((w) => w.contributionDays);
}
