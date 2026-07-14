// Sprites are generated procedurally as a circular "blob" grid, so the
// creature scales smoothly across evolution stages, then layered with
// stage-specific anatomy (feet, tail, horns, wings, cape, crown) and a
// simple two-tone shading pass so it reads as a lit sphere instead of a
// flat swatch. The goal is a creature that looks meaningfully different
// at each stage, not just "the same blob, but bigger."
//
// Grid pixel values:
//   0 = empty        1 = body        2 = wing         3 = crown
//   4 = body shadow   5 = body highlight   6 = tail     7 = horn
//   8 = cape          9 = foot

const STAGE_CONFIG = {
  baby: { size: 11, radiusFactor: 0.40 },
  growing: { size: 13, radiusFactor: 0.42 },
  advanced: { size: 15, radiusFactor: 0.44 },
  legendary: { size: 17, radiusFactor: 0.45 },
};

function generateBlobGrid(size, radiusFactor) {
  const grid = Array.from({ length: size }, () => Array(size).fill(0));
  const center = (size - 1) / 2;
  const radius = size * radiusFactor;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const dx = col - center;
      // Flatten the top slightly and widen the bottom for a "creature"
      // silhouette rather than a perfect circle.
      const dy = (row - center) * 1.05 + 0.6;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) grid[row][col] = 1;
    }
  }
  return grid;
}

function set(grid, row, col, value) {
  if (grid[row] && col >= 0 && col < grid[row].length) grid[row][col] = value;
}

function addFeet(grid, size) {
  const bottomRow = findBottomRow(grid);
  const center = Math.round((size - 1) / 2);
  set(grid, bottomRow + 1, center - Math.round(size * 0.15), 9);
  set(grid, bottomRow + 1, center + Math.round(size * 0.15), 9);
}

function addEars(grid, size) {
  const earRow = Math.round(size * 0.08);
  const leftCol = Math.round(size * 0.24);
  const rightCol = size - 1 - leftCol;
  set(grid, earRow, leftCol, 1);
  set(grid, earRow, rightCol, 1);
}

function addTail(grid, size) {
  const bottomRow = findBottomRow(grid);
  const rightCol = size - 1 - Math.round(size * 0.12);
  set(grid, bottomRow - 1, rightCol + 1, 6);
  set(grid, bottomRow, rightCol + 2, 6);
  set(grid, bottomRow - 2, rightCol + 2, 6);
}

function addHorns(grid, size) {
  const row = Math.max(0, Math.round(size * 0.02));
  const center = Math.round((size - 1) / 2);
  set(grid, row, center - Math.round(size * 0.28), 7);
  set(grid, row, center + Math.round(size * 0.28), 7);
}

function addWings(grid, size) {
  const row = Math.round(size * 0.48);
  const leftCol = 0;
  const rightCol = size - 1;
  set(grid, row, leftCol, 2);
  set(grid, row - 1, leftCol, 2);
  set(grid, row + 1, leftCol - 1 >= 0 ? leftCol : leftCol, 2);
  set(grid, row, rightCol, 2);
  set(grid, row - 1, rightCol, 2);
}

function addCape(grid, size) {
  const bottomRow = findBottomRow(grid);
  const center = Math.round((size - 1) / 2);
  for (let i = -3; i <= 3; i++) {
    set(grid, bottomRow + 1, center + i, 8);
  }
  set(grid, bottomRow + 2, center - 2, 8);
  set(grid, bottomRow + 2, center + 2, 8);
}

function addCrown(grid, size) {
  const row = Math.max(0, Math.round(size * 0.0));
  const center = Math.round((size - 1) / 2);
  for (const offset of [-3, -1, 1, 3]) {
    set(grid, row, center + offset, 3);
  }
  set(grid, row - 1 >= 0 ? row - 1 : row, center, 3);
}

function findBottomRow(grid) {
  for (let row = grid.length - 1; row >= 0; row--) {
    if (grid[row].includes(1)) return row;
  }
  return grid.length - 1;
}

/** Two-tone shading: top-most body pixel per column gets a highlight,
 * bottom-most gets a shadow — a cheap but effective "lit sphere" look. */
function applyShading(grid) {
  const size = grid.length;
  for (let col = 0; col < size; col++) {
    const filledRows = [];
    for (let row = 0; row < size; row++) {
      if (grid[row][col] === 1) filledRows.push(row);
    }
    if (filledRows.length >= 2) {
      grid[filledRows[0]][col] = 5;
      grid[filledRows[filledRows.length - 1]][col] = 4;
    }
  }
}

/**
 * Returns { grid, size, eyes, mouth, cheeks } for a given stage.
 */
export function getSprite(stageId) {
  const config = STAGE_CONFIG[stageId] ?? STAGE_CONFIG.baby;
  const { size, radiusFactor } = config;
  const grid = generateBlobGrid(size, radiusFactor);

  addFeet(grid, size);

  if (stageId === "growing" || stageId === "advanced" || stageId === "legendary") {
    addEars(grid, size);
    addTail(grid, size);
  }
  if (stageId === "advanced" || stageId === "legendary") {
    addWings(grid, size);
    addHorns(grid, size);
  }
  if (stageId === "legendary") {
    addCape(grid, size);
    addCrown(grid, size);
  }

  applyShading(grid);

  const eyeRow = Math.round(size * 0.4);
  const eyeOffset = Math.max(2, Math.round(size * 0.19));
  const center = Math.round((size - 1) / 2);
  const eyes = [
    [eyeRow, center - eyeOffset],
    [eyeRow, center + eyeOffset],
  ];

  const mouthRow = Math.round(size * 0.6);
  const mouth = [mouthRow, center];

  const cheeks = [
    [eyeRow + 1, center - eyeOffset - 2],
    [eyeRow + 1, center + eyeOffset + 2],
  ];

  return { grid, size, eyes, mouth, cheeks };
}

export const STAGE_IDS = Object.keys(STAGE_CONFIG);
