import { writeFile, mkdir } from "node:fs/promises";
import { buildSVG } from "../src/render/svgBuilder.js";
import { STAGES } from "../src/creature/evolution.js";

// Hand-crafted mock "state" objects — same shape buildCreatureState() produces —
// so we can render every stage/mood/easter-egg combination without hitting
// the GitHub API.
function mock({
  stage, mood, moodReason, traits = [], stats,
  name = null, shiny = false, milestone = null, seasonal = null,
  daysTogether = 42, bondLevel = 1, event = null,
}) {
  const stageDef = STAGES.find((s) => s.id === stage);
  return {
    stage, stageLabel: stageDef.label, formName: stageDef.formName, evolveQuote: stageDef.evolveQuote,
    mood, moodReason, traits, stats, name, shiny, milestone, seasonal, daysTogether, bondLevel, event,
    progressToNextStage: 0.5,
  };
}

const scenarios = [
  {
    file: "baby-idle.svg",
    username: "octocat",
    state: mock({
      stage: "baby", mood: "idle", moodReason: "Active today!",
      stats: { totalContributions: 12, currentStreak: 2, longestStreak: 4, totalStars: 0, totalRepos: 1, daysSinceLastCommit: 0 },
      daysTogether: 3, bondLevel: 1,
    }),
  },
  {
    file: "growing-celebrating-newstar.svg",
    username: "hopper",
    state: mock({
      stage: "growing", mood: "celebrating", moodReason: "Someone starred a repo!",
      traits: [{ id: "js_fan", label: "JS Enjoyer" }],
      stats: { totalContributions: 120, currentStreak: 9, longestStreak: 15, totalStars: 8, totalRepos: 5, daysSinceLastCommit: 0 },
      daysTogether: 30, bondLevel: 3,
    }),
  },
  {
    file: "advanced-thinking.svg",
    username: "torvalds",
    state: mock({
      stage: "advanced", mood: "thinking", moodReason: "Wondering when the next commit is coming.",
      traits: [{ id: "rustacean", label: "Rustacean" }, { id: "marathoner", label: "Marathoner" }],
      stats: { totalContributions: 340, currentStreak: 0, longestStreak: 44, totalStars: 210, totalRepos: 34, daysSinceLastCommit: 1 },
      daysTogether: 210, bondLevel: 5, name: "Kernel",
    }),
  },
  {
    file: "legendary-proud-evolution.svg",
    username: "ada",
    state: mock({
      stage: "legendary", mood: "proud", moodReason: "Just evolved into a new form!", event: "leveled_up",
      traits: [{ id: "pythonista", label: "Pythonista" }, { id: "social_butterfly", label: "Social Butterfly" }, { id: "explorer", label: "Explorer" }],
      stats: { totalContributions: 620, currentStreak: 21, longestStreak: 90, totalStars: 1400, totalRepos: 41, daysSinceLastCommit: 0 },
      daysTogether: 400, bondLevel: 5, name: "Nova Prime",
    }),
  },
  {
    file: "growing-sleeping.svg",
    username: "grace",
    state: mock({
      stage: "growing", mood: "sleeping", moodReason: "Fast asleep. No commits in over a week.",
      traits: [{ id: "night_owl", label: "Night Owl" }],
      stats: { totalContributions: 88, currentStreak: 0, longestStreak: 12, totalStars: 3, totalRepos: 6, daysSinceLastCommit: 9 },
      daysTogether: 60, bondLevel: 2,
    }),
  },
  {
    file: "advanced-missing-you.svg",
    username: "linus",
    state: mock({
      stage: "advanced", mood: "missing_you", moodReason: "No commits in two weeks. It really misses you.",
      traits: [{ id: "explorer", label: "Explorer" }],
      stats: { totalContributions: 250, currentStreak: 0, longestStreak: 30, totalStars: 40, totalRepos: 12, daysSinceLastCommit: 15 },
      daysTogether: 150, bondLevel: 4,
    }),
  },
  {
    file: "baby-glitch.svg",
    username: "ghost",
    state: mock({
      stage: "baby", mood: "glitch", moodReason: "It's been so long the connection is fraying.",
      stats: { totalContributions: 5, currentStreak: 0, longestStreak: 2, totalStars: 0, totalRepos: 2, daysSinceLastCommit: 32 },
      daysTogether: 5, bondLevel: 1,
    }),
  },
  {
    file: "shiny-legendary.svg",
    username: "shiny-example-seed",
    state: mock({
      stage: "legendary", mood: "idle", moodReason: "Active today!", shiny: true,
      traits: [{ id: "marathoner", label: "Marathoner" }],
      stats: { totalContributions: 700, currentStreak: 33, longestStreak: 60, totalStars: 500, totalRepos: 22, daysSinceLastCommit: 0 },
      daysTogether: 365, bondLevel: 5, name: "Iris", milestone: { type: "stars", value: 500 },
    }),
  },
  {
    file: "seasonal-baby.svg",
    username: "pumpkin",
    state: mock({
      stage: "baby", mood: "idle", moodReason: "Active today!",
      seasonal: { id: "pumpkin", label: "🎃" },
      stats: { totalContributions: 30, currentStreak: 3, longestStreak: 5, totalStars: 1, totalRepos: 2, daysSinceLastCommit: 0 },
      daysTogether: 14, bondLevel: 2,
    }),
  },
];

async function run() {
  await mkdir("examples", { recursive: true });
  for (const { file, username, state } of scenarios) {
    const svg = buildSVG(state, username);
    await writeFile(`examples/${file}`, svg, "utf8");
    console.log(`wrote examples/${file}`);
  }
}

run();
