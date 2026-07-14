const LANGUAGE_TRAITS = {
  Python: { id: "pythonista", label: "Pythonista", icon: "python" },
  JavaScript: { id: "js_fan", label: "JS Enjoyer", icon: "js" },
  TypeScript: { id: "type_safe", label: "Type-Safe", icon: "ts" },
  Rust: { id: "rustacean", label: "Rustacean", icon: "rust" },
  Go: { id: "gopher", label: "Gopher", icon: "go" },
  Java: { id: "java_dev", label: "Java Dev", icon: "java" },
  "C++": { id: "cpp_wizard", label: "C++ Wizard", icon: "cpp" },
  Ruby: { id: "rubyist", label: "Rubyist", icon: "ruby" },
};

/**
 * Traits are cosmetic + flavor-text personality markers, computed from
 * activity patterns. They don't affect evolution stage, only presentation.
 */
export function computeTraits({ events, repos, longestStreak, totalStars, totalRepos }) {
  const traits = [];

  // Night owl: >40% of push events happened between 22:00–06:00 UTC.
  if (events.length >= 5) {
    const nightPushes = events.filter((e) => {
      const hour = new Date(e.created_at).getUTCHours();
      return hour >= 22 || hour < 6;
    });
    if (nightPushes.length / events.length > 0.4) {
      traits.push({ id: "night_owl", label: "Night Owl", icon: "moon" });
    }
  }

  // Language affinity: most common primary language across non-fork repos.
  const langCounts = {};
  for (const r of repos) {
    if (r.fork || !r.language) continue;
    langCounts[r.language] = (langCounts[r.language] || 0) + 1;
  }
  const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0];
  if (topLang && LANGUAGE_TRAITS[topLang[0]]) {
    traits.push(LANGUAGE_TRAITS[topLang[0]]);
  }

  if (longestStreak >= 30) {
    traits.push({ id: "marathoner", label: "Marathoner", icon: "fire" });
  }

  if (totalStars >= 100) {
    traits.push({ id: "social_butterfly", label: "Social Butterfly", icon: "star" });
  }

  if (totalRepos >= 20) {
    traits.push({ id: "explorer", label: "Explorer", icon: "compass" });
  }

  return traits;
}
