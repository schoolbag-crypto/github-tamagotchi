// Generates SMIL (<animate>/<animateTransform>) markup fragments. SMIL works
// in SVGs loaded as plain images (i.e. via a README <img> tag), which is
// what makes "no server, no JS" animation possible here.

/** Gentle up/down breathing bounce — used as the baseline for every mood. */
export function idleBounceAnimation(amplitude = 2, duration = "2.4s") {
  return `<animateTransform attributeName="transform" type="translate"
      values="0 0; 0 -${amplitude}; 0 0" dur="${duration}" repeatCount="indefinite" additive="sum" />`;
}

/** Periodic blink: eyes scale to a thin line and back. */
export function blinkAnimation() {
  return `<animate attributeName="transform" attributeType="XML"
      values="scale(1,1);scale(1,1);scale(1,0.1);scale(1,1);scale(1,1)"
      keyTimes="0;0.85;0.9;0.95;1" dur="4s" repeatCount="indefinite" />`;
}

/** Bigger, faster excited bounce + squash/stretch for celebration. */
export function celebrationBounceAnimation() {
  return `<animateTransform attributeName="transform" type="scale"
      values="1,1;1.08,0.92;0.95,1.08;1,1" dur="0.6s" repeatCount="indefinite"
      additive="sum" />`;
}

/** Confetti: small colored rects flying outward and fading. */
export function confetti(cx, cy) {
  const colors = ["#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#ff922b"];
  let pieces = "";
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const dx = Math.cos(angle) * 40;
    const dy = Math.sin(angle) * 40 - 10;
    const color = colors[i % colors.length];
    const delay = (i % 4) * 0.15;
    pieces += `
      <rect x="${cx}" y="${cy}" width="3" height="3" fill="${color}" opacity="0">
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.6;1"
          dur="1.4s" begin="${delay}s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate"
          values="0,0; ${dx},${dy}" dur="1.4s" begin="${delay}s" repeatCount="indefinite" />
      </rect>`;
  }
  return pieces;
}

/** Floating "Z" letters for sleep. */
export function zzz(x, y) {
  return `
    <g font-family="monospace" font-weight="bold" fill="#8aa3c7">
      <text x="${x}" y="${y}" font-size="10" opacity="0">Z
        <animate attributeName="opacity" values="0;1;0" keyTimes="0;0.5;1" dur="3s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate"
          values="0,0; 4,-14" dur="3s" repeatCount="indefinite" />
      </text>
      <text x="${x + 8}" y="${y - 6}" font-size="8" opacity="0">Z
        <animate attributeName="opacity" values="0;1;0" keyTimes="0;0.5;1" dur="3s" begin="0.6s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate"
          values="0,0; 4,-14" dur="3s" begin="0.6s" repeatCount="indefinite" />
      </text>
    </g>`;
}

/** A little "?" thought bubble that fades in and out. */
export function thinkingBubble(x, y) {
  return `
    <g>
      <circle cx="${x}" cy="${y}" r="9" fill="#ffffff" stroke="#c7d2e0" stroke-width="1" opacity="0">
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <text x="${x}" y="${y + 4}" font-family="monospace" font-weight="bold" font-size="11"
        text-anchor="middle" fill="#5c6f8a" opacity="0">?
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur="2.6s" repeatCount="indefinite" />
      </text>
    </g>`;
}

/** RGB-split glitch flicker: duplicates a shape in offset red/cyan, flickering. */
export function glitchWrapperOpen() {
  return `<g>
    <animateTransform attributeName="transform" type="translate"
      values="0,0; -1,0; 1,0; 0,0; 2,0; 0,0" keyTimes="0;0.2;0.4;0.6;0.8;1"
      dur="0.5s" repeatCount="indefinite" />`;
}
export function glitchWrapperClose() {
  return `</g>`;
}

/** Evolution ceremony: an expanding ring burst + a title card with the new
 * form's name. Deliberately bigger and slower than the star-confetti
 * celebration so a level-up reads as a distinct, bigger deal. */
export function evolutionBurst(cx, cy) {
  const rings = [0, 0.4, 0.8]
    .map(
      (delay) => `
      <circle cx="${cx}" cy="${cy}" r="4" fill="none" stroke="#ffd93d" stroke-width="2" opacity="0">
        <animate attributeName="r" values="4;55" dur="1.6s" begin="${delay}s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0" dur="1.6s" begin="${delay}s" repeatCount="indefinite" />
      </circle>`
    )
    .join("");
  const sparkles = Array.from({ length: 10 })
    .map((_, i) => {
      const angle = (Math.PI * 2 * i) / 10;
      const dist = 46;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const delay = (i % 5) * 0.18;
      return `
      <circle cx="${cx}" cy="${cy}" r="1.6" fill="#fff4c2" opacity="0">
        <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="${delay}s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate"
          values="0,0; ${dx},${dy}" dur="1.8s" begin="${delay}s" repeatCount="indefinite" />
      </circle>`;
    })
    .join("");
  return rings + sparkles;
}

/** A single drooping tear + downturned posture cue for "missing you". */
export function tear(x, y) {
  return `
    <g fill="#7fb3ff">
      <path d="M ${x} ${y} q -2 5 0 8 q 2 -3 0 -8 z" opacity="0">
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.7;1" dur="2.8s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,10" dur="2.8s" repeatCount="indefinite" />
      </path>
    </g>`;
}

/** Periodic diagonal glints sweeping across the body — reserved for shiny
 * (rare recolor) creatures so they visibly sparkle even when idle. */
export function shinyShimmer(cx, cy, size) {
  return `
    <rect x="${cx - size / 2}" y="${cy - size / 2}" width="${size}" height="${size}"
      fill="url(#shinyGradient)" opacity="0" transform="rotate(20 ${cx} ${cy})">
      <animate attributeName="opacity" values="0;0.9;0" keyTimes="0;0.5;1" dur="3.2s" repeatCount="indefinite" />
      <animateTransform attributeName="transform" type="translate"
        values="-${size},0; ${size},0" dur="3.2s" repeatCount="indefinite" additive="sum" />
    </rect>`;
}

/** Small emoji-style badge (seasonal accessory, milestone ribbon, etc.)
 * placed at an arbitrary anchor point, with a gentle pulse. */
export function badge(x, y, emoji, fontSize = 14) {
  return `
    <text x="${x}" y="${y}" font-size="${fontSize}" text-anchor="middle">${emoji}
      <animateTransform attributeName="transform" type="scale" additive="sum"
        values="1;1.15;1" dur="1.6s" repeatCount="indefinite" />
    </text>`;
}

/** Row of small heart glyphs representing bond level (1-5), filled up to
 * the current level. */
export function bondHearts(x, y, level) {
  let hearts = "";
  for (let i = 0; i < 5; i++) {
    const filled = i < level;
    hearts += `<text x="${x + i * 11}" y="${y}" font-size="10" fill="${filled ? "#ff6b81" : "#d8dee8"}">♥</text>`;
  }
  return hearts;
}

