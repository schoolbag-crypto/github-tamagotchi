# Architecture

## The core constraint

GitHub renders README Markdown to static HTML and strips `<script>` tags —
so a README can never run live JavaScript. Everything here is designed
around that fact.

The trick: **`<img src="creature.svg">` is just an image request.** Browsers
render SVG images with full support for [SMIL animation](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL)
(`<animate>`, `<animateTransform>`) even when the SVG is loaded as an `<img>`,
not inlined. So the "liveness" comes from:

1. A **GitHub Action** that periodically (cron) and reactively (on push)
   re-fetches the user's activity and re-renders the SVG file.
2. The SVG itself containing **baked-in CSS/SMIL animations** (bounce, blink,
   confetti, Zzz, glitch) so it doesn't look static even between refreshes.

No server, no database, no hosting bill. State lives as a small JSON file
committed alongside the SVG in the *consumer's own repo*.

## Data flow

```
GitHub Action (cron / on push / manual)
        │
        ▼
 fetchActivity.js ──► GitHub GraphQL (contribution calendar)
        │             GitHub REST   (repos, stars, languages)
        │             GitHub REST   (recent push events, for night-owl signal)
        ▼
 state.js: buildCreatureState(raw, previousState)
        │  - evolution.js   → stage/form from total contributions/year
        │  - streak.js      → current/longest streak, days since last commit
        │  - traits.js      → personality traits from activity patterns
        │  - identity.js    → shiny variant, milestones, season, bond, adoption date
        │  - diff vs previousState → discrete "event" (new_star / new_repo /
        │                            leveled_up / new_streak_record / birthday)
        │  - mood.js        → mood, prioritizing events over ambient decay
        ▼
 svgBuilder.js ──► creature.svg  (pixel art + SMIL animation + stat readout)
        │
        ▼
 write creature.svg + state.json, commit + push (handled by the workflow, not the JS)
```

## The identity/attachment layer

`creature/identity.js` is a set of small pure functions that exist purely
to make a specific creature feel like *your* creature rather than a
re-rollable stat readout:

- **`isShiny(username)`** — a djb2 hash of the username, mod 64. Purely
  cosmetic, purely deterministic: a shiny creature has always been shiny
  and always will be, the same way a Pokémon shiny is permanent. No state
  needs to be persisted for this — it's a pure function of an identity
  that never changes.
- **`nextBondLevel(previousBondPoints)`** — increments every run,
  regardless of coding activity. This is deliberately decoupled from
  `evolution.js`: leveling up rewards *output*, bond rewards *showing up*.
  Both matter for attachment, but for different reasons, so they're
  tracked as two separate meters rather than conflated into one score.
- **`findMilestone` / `seasonalAccessory`** — small "world is real too"
  touches: round numbers feel good regardless of context, and an actual
  pumpkin in October costs nothing to implement but adds a lot of
  "oh, it noticed" delight.
- **`isAdoptionAnniversary`** — the only identity check that depends on
  persisted state (`adoptedAt`, written once on the very first run and
  never touched again).

## Why a diff-based event system?

Moods like "celebrating because you got a star" only make sense as a
**transition**, not a snapshot — "5 stars" alone doesn't tell you if a star
was *just* gained. So every run persists a minimal `state.json`
(`{ stageId, totalStars, totalRepos, updatedAt }`) and the next run diffs
against it. This is the same pattern used by webhook-less polling systems
generally: cheap, stateless between runs except for one small file.

**Known limitation:** because updates are periodic (default every 6 hours),
"celebrating" reflects the state *as of the last run*, not the literal
instant a star happened. Lowering the cron interval trades GitHub Actions
minutes for responsiveness.

## Why procedural sprites instead of hand-drawn frame sets?

`render/sprites.js` generates the creature body as a circular pixel "blob"
whose size scales with evolution stage, then layers on stage-specific
anatomy (feet at every stage, ears + a tail from Byte onward, horns +
wings at Cipher, a cape + crown at Nova) and a cheap two-tone shading pass
(top-most body pixel per column lightens, bottom-most darkens) so it reads
as a lit sphere instead of a flat swatch. This means:

- Stages scale cleanly without needing 4 separate hand-authored sprite sheets.
- Each stage is visually distinct by *silhouette*, not just size — Sprout
  and Nova should never be mistaken for "the same shape, scaled."
- Adding a 5th stage later is a config change (a `STAGE_CONFIG` entry plus
  whichever `add*()` decorations it earns) not a new drawing.
- Body color can be personalized by the user's dominant language trait, or
  overridden entirely by the shiny palette, without touching the shape logic.

Eyes, mouth, and cheeks are computed separately from the body grid so they
can be animated or swapped per-mood (blinking, closing for sleep, drooping
for missing-you, blushing when happy) without regenerating the sprite.

## Extending it

- **New mood:** add a case to `creature/mood.js`, a palette entry in
  `MOOD_PANEL_COLOR`, a mouth/eye case in `svgBuilder.js`, and (optionally)
  an overlay in `render/animations.js`.
- **New trait:** add an entry to `creature/traits.js`'s detection logic.
  Give it a `LANGUAGE_TINT`-style color in `svgBuilder.js` if it should
  recolor the creature.
- **New evolution stage:** add a row to `STAGES` in `creature/evolution.js`
  (with a `formName` and `evolveQuote`) and a matching entry in
  `STAGE_CONFIG` in `render/sprites.js`, plus any new `add*()` decoration.
- **New identity/easter egg:** add a pure function to `creature/identity.js`
  and wire its output into `state.js` and then `svgBuilder.js`'s badge
  logic. Keeping these as pure functions (no side effects, explicit
  inputs) is what keeps them all independently unit-testable.
