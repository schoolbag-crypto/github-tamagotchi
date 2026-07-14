import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { GitHubClient } from "./github/client.js";
import { fetchContributions, fetchRepos, fetchRecentEvents } from "./github/fetchActivity.js";
import { buildCreatureState } from "./creature/state.js";
import { buildSVG } from "./render/svgBuilder.js";

async function readJsonSafe(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.TAMAGOTCHI_USERNAME || process.env.GITHUB_REPOSITORY_OWNER;
  const name = process.env.TAMAGOTCHI_NAME || "";
  const outputPath = process.env.TAMAGOTCHI_OUTPUT_PATH || ".github-tamagotchi/creature.svg";
  const statePath = process.env.TAMAGOTCHI_STATE_PATH || ".github-tamagotchi/state.json";

  if (!token) throw new Error("GITHUB_TOKEN env var is required.");
  if (!username) throw new Error("TAMAGOTCHI_USERNAME (or GITHUB_REPOSITORY_OWNER) is required.");

  const client = new GitHubClient(token);

  console.log(`[github-tamagotchi] Fetching activity for ${username}...`);
  const [calendar, repos, events] = await Promise.all([
    fetchContributions(client, username),
    fetchRepos(client, username),
    fetchRecentEvents(client, username),
  ]);

  const previousState = await readJsonSafe(statePath);
  const state = buildCreatureState({ calendar, repos, events, username, name, now: new Date() }, previousState);

  console.log(
    `[github-tamagotchi] stage=${state.stage} (${state.formName}) mood=${state.mood} event=${state.event ?? "none"} ` +
      `streak=${state.stats.currentStreak} stars=${state.stats.totalStars} shiny=${state.shiny} bond=${state.bondLevel}`
  );

  const svg = buildSVG(state, username);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, svg, "utf8");

  await mkdir(path.dirname(statePath), { recursive: true });
  await writeFile(statePath, JSON.stringify(state._persist, null, 2), "utf8");

  console.log(`[github-tamagotchi] Wrote ${outputPath} and ${statePath}`);
}

main().catch((err) => {
  console.error("[github-tamagotchi] Failed:", err);
  process.exit(1);
});
