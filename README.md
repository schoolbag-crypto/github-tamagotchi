# 🐣 GitHub Tamagotchi

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/ci.yml)

A tiny pixel creature that lives in your README, evolves through named
forms as you code, and actually *reacts* — it gets excited over a new
star, throws a small celebration when it levels up, and gets visibly sad
if you disappear for two weeks. No server, no hosting bill: just a GitHub
Action and a self-animating SVG.

<table>
<tr>
<td><img src="examples/baby-idle.svg" width="260" alt="Sprout, idle" /></td>
<td><img src="examples/growing-celebrating-newstar.svg" width="260" alt="Byte, celebrating a new star" /></td>
<td><img src="examples/legendary-proud-evolution.svg" width="260" alt="Nova, evolution ceremony" /></td>
</tr>
<tr>
<td align="center"><sub>Sprout · idle</sub></td>
<td align="center"><sub>Byte · new star 🎉</sub></td>
<td align="center"><sub>Nova · evolution ceremony ✨</sub></td>
</tr>
</table>

<table>
<tr>
<td><img src="examples/advanced-missing-you.svg" width="260" alt="Cipher, missing you" /></td>
<td><img src="examples/growing-sleeping.svg" width="260" alt="Byte, asleep" /></td>
<td><img src="examples/shiny-legendary.svg" width="260" alt="Shiny Nova, a rare variant" /></td>
</tr>
<tr>
<td align="center"><sub>Cipher · missing you 😢 (14+ days quiet)</sub></td>
<td align="center"><sub>Byte · asleep 😴</sub></td>
<td align="center"><sub>✦ Shiny Nova — a 1-in-64 rare variant</sub></td>
</tr>
</table>

> All of these are live SVGs straight from `/examples` — open one directly
> to see the bounce, blink, confetti, tears, and shiny shimmer actually
> animate.

## Why this doesn't feel like a stats card

- **Evolution is a story, not a stat bar.** Your creature isn't "level 3"
  — it's **Sprout → Byte → Cipher → Nova**, each with its own silhouette
  (feet and a tail at Byte, horns and wings at Cipher, a cape and crown at
  Nova) and a one-line quote the moment it evolves.
- **It remembers you.** Every run persists a small `state.json`: when you
  adopted it, your longest-ever streak, and a **bond level** that grows
  every time the Action checks in — separate from your coding output,
  because showing up matters even on quiet days.
- **You can name it.** Set `creature_name` once and it's "Pixel the Byte,"
  not "octocat the Growing."
- **It has moods, not a mood.** `idle → thinking → sleepy → sleeping →
  missing_you → glitch` — a slow, readable decay, not a single binary
  "active/inactive" flag. Two weeks of silence gets a droopy-eyed tear, not
  an immediate jump to alarming.
- **Rare, permanent surprises.** About 1 in 64 creatures is secretly
  **shiny** — a permanent alternate color, deterministic per username, so
  it's either always been shiny or never is. Hitting a "nice" number like
  1337 or 2026 total contributions pops a milestone badge. Real-world dates
  matter too — expect a pumpkin in late October and a party hat on New
  Year's.

## How it works

1. A GitHub Action runs on a schedule (and after every push) in **your**
   repo.
2. It fetches your public activity — contribution calendar, repos, stars,
   recent push timestamps.
3. It diffs against last run's saved state to detect *events* (new star,
   new repo, leveled up, personal streak record, adoption anniversary),
   computes mood/traits/identity, and renders it all into
   `.github-tamagotchi/creature.svg`.
4. The Action commits that file back to your repo.
5. Your README embeds it with a plain `<img>` tag, so it's always current.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design
rationale, including why this works without a server at all.

## Setup

**1. Add the workflow.** Copy
[`examples/consumer-workflow.yml`](examples/consumer-workflow.yml) into your
repo at `.github/workflows/tamagotchi.yml`, and swap in the actual action
reference (`your-username/github-tamagotchi@v1`) once you've published this
repo.

**2. Run it once** — either wait for the cron, or trigger it manually from
the *Actions* tab (`Run workflow`).

**3. Embed it in your README:**

```markdown
![My coding creature](.github-tamagotchi/creature.svg)
```

That's it — no API keys to manage, since `secrets.GITHUB_TOKEN` (provided
automatically by Actions) has enough read access for public profile data.

### Configuration

Only the token is required:

| Input | Default | Description |
|---|---|---|
| `github_token` | — | Usually `${{ secrets.GITHUB_TOKEN }}` |
| `username` | repo owner | Whose activity to track |
| `creature_name` | *(none)* | Give your creature a name, e.g. `"Pixel"` |
| `output_path` | `.github-tamagotchi/creature.svg` | Where the SVG is written |
| `state_path` | `.github-tamagotchi/state.json` | Where run-over-run state is persisted |

## Evolution

| Stage | Form | Contributions/year |
|---|---|---|
| 🥚 Baby | **Sprout** | 0+ |
| 🌱 Growing | **Byte** | 50+ |
| ⚡ Advanced | **Cipher** | 200+ |
| 👑 Legendary | **Nova** | 500+ |

Based on the last 12 months of contributions (GitHub's own calendar
window), not lifetime commits — fair to newer accounts, and each stage
stays achievable. A level-up triggers a distinct **evolution ceremony**
(expanding rings + sparkle burst) that's visually bigger than a regular
celebration, plus a quote introducing the new form.

## Moods

Priority order — a fresh event always beats ambient decay:

`celebrating` (new star / new repo / streak record / adoption
anniversary) → `proud` (just evolved) → `sleeping` (7–13 days quiet) →
`missing_you` (14–29 days quiet — droopy eyes, a single tear) → `glitch`
(30+ days quiet — a fraying, RGB-split easter egg) → `idle` (active
today) → `thinking` (default in-between state)

## Personality traits

Traits are derived from your habits and tint the creature's color:

- **Night Owl** — 40%+ of recent pushes between 22:00–06:00 UTC
- **Pythonista / JS Enjoyer / Rustacean / Gopher / ...** — dominant
  language across your repos
- **Marathoner** — a 30+ day contribution streak
- **Social Butterfly** — 100+ total stars
- **Explorer** — 20+ repos

## Attachment mechanics

- **Adoption date** — the first time the Action ever runs for you is
  remembered forever, shown as "together N days."
- **Bond level** (1–5, shown as hearts) — increases every run, independent
  of your coding activity. It's a small nudge that *checking in* on your
  creature is its own thing, separate from grinding commits.
- **Personal records** — beating your own longest streak triggers a
  distinct celebration, separate from generic star/repo events.
- **Adoption anniversary** — once a year, on the day you first ran the
  Action, your creature throws a small party.

## Local development

```bash
npm install
npm test                 # run the unit tests
npm run examples         # regenerate example SVGs in /examples from mock data
GITHUB_TOKEN=ghp_xxx TAMAGOTCHI_USERNAME=octocat npm start   # run against real data
```

CI (`.github/workflows/ci.yml`) syntax-checks every file, runs the test
suite, and fails the build if the committed `/examples` SVGs have drifted
from what the renderer currently produces.

## Project structure

```
src/
  github/       API access (REST + GraphQL, zero dependencies)
  creature/     Evolution, streaks, traits, mood, identity/bond — pure logic, fully unit tested
  render/       Pixel sprites, SMIL animation snippets, SVG assembly
action.yml      Composite GitHub Action definition
examples/       Generated example SVGs + a copy-paste consumer workflow
docs/           Architecture notes
```

## Limitations (by design)

- Mood reflects the state as of the **last scheduled run**, not the literal
  instant something happened — lower the cron interval for more
  responsiveness, at the cost of Action minutes.
- "Night owl" uses UTC hours from the last ~90 days of public events
  (GitHub API's retention window), not your local timezone.
- One creature per GitHub user (not per-repo) — that's intentional, it's a
  pet, not a zoo.
- "Shiny" status and evolution forms are cosmetic; they don't change
  evolution thresholds or mood logic.

## License

MIT — see [LICENSE](LICENSE).
