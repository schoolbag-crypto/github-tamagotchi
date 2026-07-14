// Evolution is driven by total contributions in the last year (GitHub's
// own contribution calendar window). This keeps it fair to older accounts
// instead of rewarding raw all-time commit count.
//
// Each stage is a distinct *form* with its own name and a one-line quote
// used the moment a user evolves into it — the goal is for leveling up to
// feel like a small story beat, not a stat bar filling.
export const STAGES = [
  {
    id: "baby",
    label: "Baby",
    formName: "Sprout",
    min: 0,
    evolveQuote: "A tiny creature blinks awake for the first time.",
  },
  {
    id: "growing",
    label: "Growing",
    formName: "Byte",
    min: 50,
    evolveQuote: "Sprout stretches out, grows a tail, and starts exploring.",
  },
  {
    id: "advanced",
    label: "Advanced",
    formName: "Cipher",
    min: 200,
    evolveQuote: "Byte's wings unfold. It's starting to look unstoppable.",
  },
  {
    id: "legendary",
    label: "Legendary",
    formName: "Nova",
    min: 500,
    evolveQuote: "Cipher ascends. A crown of light settles over Nova.",
  },
];

export function stageForCommits(totalContributions) {
  let current = STAGES[0];
  for (const stage of STAGES) {
    if (totalContributions >= stage.min) current = stage;
  }
  return current;
}

export function stageIndex(stageId) {
  return STAGES.findIndex((s) => s.id === stageId);
}

export function nextStage(stageId) {
  const idx = stageIndex(stageId);
  return STAGES[idx + 1] ?? null;
}

export function progressToNextStage(totalContributions, stageId) {
  const idx = stageIndex(stageId);
  const current = STAGES[idx];
  const next = STAGES[idx + 1];
  if (!next) return 1; // maxed out (legendary)
  const span = next.min - current.min;
  const progressed = totalContributions - current.min;
  return Math.max(0, Math.min(1, progressed / span));
}
