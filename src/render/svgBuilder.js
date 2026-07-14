import { getSprite } from "./sprites.js";
import {
  idleBounceAnimation,
  blinkAnimation,
  celebrationBounceAnimation,
  confetti,
  zzz,
  thinkingBubble,
  glitchWrapperOpen,
  glitchWrapperClose,
  evolutionBurst,
  tear,
  shinyShimmer,
  badge,
  bondHearts,
} from "./animations.js";
 
const CANVAS_W = 320;
const CANVAS_H = 216;
const CREATURE_BOX = 100; // px square the sprite grid is scaled to fit
 
const STAGE_BODY_COLOR = {
  baby: "#8ee6a0",
  growing: "#5fd38a",
  advanced: "#3bb6a6",
  legendary: "#f2b84b",
};
const LANGUAGE_TINT = {
  pythonista: "#4b8bbe",
  js_fan: "#e0c53d",
  type_safe: "#3178c6",
  rustacean: "#c98a5e",
  gopher: "#00acd7",
  java_dev: "#e0793f",
  cpp_wizard: "#659ad2",
  rubyist: "#cc5a52",
};
 
const MOOD_PANEL_COLOR = {
  idle: "#f4f9ff",
  celebrating: "#fff8e6",
  proud: "#fff1d6",
  sleepy: "#eef0f7",
  sleeping: "#e4e8f2",
  thinking: "#f2f5fb",
  missing_you: "#eef1fb",
  glitch: "#17171c",
};
 
const SHINY_PALETTE = ["#ff9ecf", "#ffd93d", "#8ee6a0", "#7fc7ff", "#c99bff"];
 
function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("");
}
function shade(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r + amount, g + amount, b + amount]);
}
 
function buildBodyPixels(grid, cellPx, offsetX, offsetY, palette) {
  let rects = "";
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const v = grid[row][col];
      if (!v) continue;
      const color = palette[v] ?? palette[1];
      const x = offsetX + col * cellPx;
      const y = offsetY + row * cellPx;
      rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellPx.toFixed(2)}" height="${cellPx.toFixed(2)}" fill="${color}" />`;
    }
  }
  return rects;
}
 
function buildMouth(mood, cx, cy) {
  switch (mood) {
    case "celebrating":
    case "proud":
      return `<path d="M ${cx - 6} ${cy} Q ${cx} ${cy + 8} ${cx + 6} ${cy}" stroke="#3a2e1f" stroke-width="1.6" fill="none" stroke-linecap="round" />`;
    case "sleeping":
      return `<line x1="${cx - 4}" y1="${cy}" x2="${cx + 4}" y2="${cy}" stroke="#3a2e1f" stroke-width="1.4" stroke-linecap="round" />`;
    case "sleepy":
      return `<path d="M ${cx - 4} ${cy + 1} Q ${cx} ${cy - 1} ${cx + 4} ${cy + 1}" stroke="#3a2e1f" stroke-width="1.3" fill="none" stroke-linecap="round" />`;
    case "missing_you":
      return `<path d="M ${cx - 5} ${cy + 2} Q ${cx} ${cy - 3} ${cx + 5} ${cy + 2}" stroke="#3a2e1f" stroke-width="1.3" fill="none" stroke-linecap="round" />`;
    case "glitch":
      return `<path d="M ${cx - 5} ${cy} L ${cx - 1} ${cy + 3} L ${cx + 2} ${cy - 2} L ${cx + 5} ${cy + 2}" stroke="#ff2d55" stroke-width="1.2" fill="none" stroke-linecap="round" />`;
    default:
      return `<path d="M ${cx - 5} ${cy - 1} Q ${cx} ${cy + 4} ${cx + 5} ${cy - 1}" stroke="#3a2e1f" stroke-width="1.4" fill="none" stroke-linecap="round" />`;
  }
}
 
function buildEyes(mood, eyeCoords, cellPx, offsetX, offsetY) {
  const closed = mood === "sleeping";
  const droopy = mood === "missing_you" || mood === "sleepy";
  let markup = "";
  for (const [row, col] of eyeCoords) {
    const cx = offsetX + col * cellPx + cellPx / 2;
    const cy = offsetY + row * cellPx + cellPx / 2;
    if (closed) {
      markup += `<line x1="${cx - 3}" y1="${cy}" x2="${cx + 3}" y2="${cy}" stroke="#26313f" stroke-width="1.4" stroke-linecap="round" />`;
    } else {
      const pupilOffsetY = droopy ? 1 : 0;
      markup += `
        <g transform="translate(${cx},${cy})">
          ${blinkAnimation()}
          <circle r="3.6" fill="#ffffff" />
          <circle cy="${pupilOffsetY}" r="1.7" fill="#26313f" />
        </g>`;
    }
  }
  return markup;
}
 
function buildBlush(cheekCoords, cellPx, offsetX, offsetY) {
  return cheekCoords
    .map(([row, col]) => {
      const cx = offsetX + col * cellPx + cellPx / 2;
      const cy = offsetY + row * cellPx + cellPx / 2;
      return `<circle cx="${cx}" cy="${cy}" r="${cellPx * 0.55}" fill="#ff9a9a" opacity="0.35" />`;
    })
    .join("");
}
 
function buildMoodOverlay(mood, cx, boxTop) {
  switch (mood) {
    case "celebrating":
      return confetti(cx, boxTop + 20);
    case "proud":
      return confetti(cx, boxTop + 20) + evolutionBurst(cx, boxTop + 45);
    case "sleeping":
      return zzz(cx + 32, boxTop + 8);
    case "thinking":
      return thinkingBubble(cx + 38, boxTop + 12);
    case "missing_you":
      return tear(cx + 20, boxTop + 44);
    default:
      return "";
  }
}
 
function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  }[c]));
}
 
function truncate(str, max) {
  const s = String(str);
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
 
/**
 * @param {object} state - output of buildCreatureState()
 * @param {string} username
 */
export function buildSVG(state, username) {
  const { stage, mood, traits, stats, moodReason, formName, evolveQuote, shiny, milestone, seasonal, daysTogether, bondLevel, name, event } = state;
  const sprite = getSprite(stage);
  const cellPx = CREATURE_BOX / sprite.size;
  const gridPx = cellPx * sprite.size;
  const offsetX = (CANVAS_W - gridPx) / 2;
  const offsetY = 24;
 
  const langTrait = traits.find((t) => LANGUAGE_TINT[t.id]);
  const baseColor = langTrait ? LANGUAGE_TINT[langTrait.id] : STAGE_BODY_COLOR[stage];
  const bodyColor = shiny ? SHINY_PALETTE[Math.abs(hashCode(username)) % SHINY_PALETTE.length] : baseColor;
 
  const palette = {
    1: bodyColor,
    2: "#dfe9f7", // wing
    3: "#ffd93d", // crown
    4: shade(bodyColor, -28), // shadow
    5: shade(bodyColor, 28), // highlight
    6: shade(bodyColor, -12), // tail
    7: "#e8e8ea", // horn
    8: shade(bodyColor, -18), // cape
    9: shade(bodyColor, -20), // foot
  };
 
  const panelColor = MOOD_PANEL_COLOR[mood] ?? "#f4f9ff";
  const textColor = mood === "glitch" ? "#e8e8ea" : "#3a3f4b";
 
  const bodyPixels = buildBodyPixels(sprite.grid, cellPx, offsetX, offsetY, palette);
  const mouthCx = offsetX + sprite.mouth[1] * cellPx + cellPx / 2;
  const mouthCy = offsetY + sprite.mouth[0] * cellPx + cellPx / 2;
  const mouth = buildMouth(mood, mouthCx, mouthCy);
  const eyes = buildEyes(mood, sprite.eyes, cellPx, offsetX, offsetY);
  const blush = mood === "idle" || mood === "celebrating" || mood === "proud"
    ? buildBlush(sprite.cheeks, cellPx, offsetX, offsetY)
    : "";
  const overlay = buildMoodOverlay(mood, CANVAS_W / 2, offsetY);
 
  const bounceAmplitude = mood === "sleeping" || mood === "sleepy" || mood === "missing_you" ? 1 : 2.2;
  const bodyGroupTransform =
    mood === "celebrating" || mood === "proud" ? celebrationBounceAnimation() : idleBounceAnimation(bounceAmplitude);
 
  const shinyOverlay = shiny ? shinyShimmer(CANVAS_W / 2, offsetY + gridPx / 2, gridPx * 1.4) : "";
 
  const legendaryGlow = stage === "legendary"
    ? `<circle cx="${CANVAS_W / 2}" cy="${offsetY + gridPx / 2}" r="${gridPx * 0.68}" fill="url(#glow)" opacity="0.5" />`
    : "";
 
  const glitchOpen = mood === "glitch" ? glitchWrapperOpen() : "<g>";
  const glitchClose = mood === "glitch" ? glitchWrapperClose() : "</g>";
  const glitchGhosts = mood === "glitch"
    ? `<g opacity="0.4" fill="#ff2d55" transform="translate(-2,0)">${bodyPixels}</g>
       <g opacity="0.4" fill="#4dd9ff" transform="translate(2,0)">${bodyPixels}</g>`
    : "";
 
  // --- Header line: name (or username) + form name + shiny sparkle marker ---
  const displayName = truncate(name || username, 20);
  const shinyMark = shiny ? " ✦" : "";
  const headerLine = `${escapeXml(displayName)} the ${escapeXml(formName)}${shinyMark}`;
 
  // --- Footer flavor line: evolution ceremony quote takes priority, then
  // mood reason, so a level-up always gets its moment. ---
  const flavorLine = truncate(event === "leveled_up" && evolveQuote ? evolveQuote : moodReason, 46);
 
  const traitChips = traits
    .slice(0, 3)
    .map((t) => `• ${escapeXml(t.label)}`)
    .join("   ");
 
  // --- Small badges: seasonal accessory + milestone ribbon, stacked top-right ---
  let badges = "";
  if (seasonal) badges += badge(CANVAS_W - 24, offsetY + 14, seasonal.label, 16);
  if (milestone) badges += badge(CANVAS_W - 24, offsetY + 38, "🎊", 14);
 
  return `<svg width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" xmlns="http://www.w3.org/2000/svg" role="img">
  <title>${escapeXml(headerLine)} — ${escapeXml(state.stageLabel)}, ${escapeXml(mood)}</title>
  <desc>${escapeXml(flavorLine)}</desc>
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffe9a8" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#ffe9a8" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="shinyGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
    <clipPath id="panelClip">
      <rect x="0" y="0" width="${CANVAS_W}" height="${CANVAS_H}" rx="14" />
    </clipPath>
  </defs>
 
  <g clip-path="url(#panelClip)">
    <rect x="0" y="0" width="${CANVAS_W}" height="${CANVAS_H}" fill="${panelColor}" />
    ${legendaryGlow}
 
    ${glitchOpen}
      <g transform="translate(0,0)">
        ${bodyGroupTransform}
        ${glitchGhosts}
        ${bodyPixels}
        ${blush}
        ${eyes}
        ${mouth}
      </g>
    ${glitchClose}
    ${shinyOverlay}
    ${overlay}
    ${badges}
 
    <line x1="12" y1="140" x2="${CANVAS_W - 12}" y2="140" stroke="#00000014" stroke-width="1" />
 
    <text x="16" y="157" font-family="monospace" font-size="12" font-weight="bold" fill="${textColor}">
      ${headerLine}
    </text>
    <text x="16" y="172" font-family="monospace" font-size="9.5" fill="${textColor}" opacity="0.85">
      ${escapeXml(flavorLine)}
    </text>
    <text x="16" y="188" font-family="monospace" font-size="10" fill="${textColor}">
      🔥${stats.currentStreak}d  ⭐${stats.totalStars}  📦${stats.totalRepos}  💾${stats.totalContributions}/yr  ·  together ${daysTogether}d
    </text>
    <text x="16" y="202" font-family="monospace" font-size="9" fill="${textColor}" opacity="0.85">
      ${traitChips || "Keep coding to unlock traits..."}
    </text>
    ${bondHearts(CANVAS_W - 68, 202, bondLevel)}
  </g>
</svg>`;
}
 
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}
