# Design system: The Ledger

The look is an analyst's working book: content on the page, separated by hairlines, with serif figures and one raised
surface for things you can act on. The source of truth for every value below is `tailwind.config.js`;
`scripts/design-tokens.test.mjs` fails if this page and the config drift apart.

## Principles

1. **Say it once.** One title per screen, one primary button per screen, one status per phase.
2. **Rules over boxes.** A raised surface means "you can type or tap here".
3. **Color is a unit.** Signal is progress and the action. Clock is time. Brick is destructive or wrong.
4. **12px is the floor.** Sentence case everywhere (no `uppercase` or wide tracking; the test fails on them); serif only for figures and titles.

## Colour

Six named colours. Every other tone is Folio blended over Press or Graphite, and the test recomputes each one.

| Token | Value | Use |
|---|---|---|
| `surface-base` | Press `#0B0D10` | Page, splash, status bar: the single black |
| `surface-elevated` | Graphite `#151920` | Raised surfaces only (`Panel`, sheets, the nav) |
| `surface-subtle` | Folio 4% over Graphite | Input and chip fills |
| `surface-overlay` | Folio 7% over Graphite | Hover fills, sheets |
| `ink-primary` | Folio `#ECE8DF` | Text. Warm, not white |
| `ink-secondary` | Folio 72% | Body and descriptions |
| `ink-tertiary` | Folio 60% | Captions and meta. Still 4.5:1 on every surface |
| `accent`, `accent-dim` | Signal `#00C4DB` | Progress, primary button, focus, links |
| `clock`, `clock-dim` | Clock `#F7941E` | Hours and time only |
| `danger`, `danger-dim` | Brick `#F87171` | Destructive actions and errors |
| `success`, `success-dim` | Signal | Done. Same value as `accent`, named for meaning |
| `warning`, `warning-dim` | Clock | Caution. Same value as `clock`, named for meaning |
| `edge` | Folio 42% | Borders of controls: 3:1 on Press and Graphite |
| `rule` | Folio 14% | Hairlines and dividers (decorative, not a control edge) |

Every text colour reaches 4.5:1 on every surface, and `edge` reaches 3:1; both are checked by the test. Never write a hex value,
an `rgb()` value or a Tailwind default colour (`gray-400`, `white`) in `src`: the test fails on them.

## Type

Fonts are bundled (`src/assets/fonts/`); nothing is requested from a server. Latin only.

| Class | Size / line | Face | Use |
|---|---|---|---|
| `text-display` | 32 / 36, semibold | Newsreader | Screen titles. One per screen at most |
| `text-figure` | 40 / 40, semibold | Newsreader | Big numbers: percentages, hours, counts |
| `text-title` | 20 / 26, semibold | Newsreader | Block, sheet and tool titles |
| `text-body` | 15 / 24 | Hanken Grotesk | Default text, buttons, forms |
| `text-meta` | 13 / 18 | Hanken Grotesk | Captions and secondary lines |
| `text-kicker` | 12 / 16, medium, +0.02em | Hanken Grotesk | Small labels above a block. Sentence case |

The three serif roles set their own face, so the size class alone is enough. Use `font-mono` (JetBrains Mono) for IDs,
formulas and dates in tables. UI weights are 400, 500 and 600; do not use bold, extrabold or black. Numerals are
tabular and lining. No text is below 12px, and there are no arbitrary `text-[Npx]` sizes.

## Surfaces

| Component | Looks like | Use it for |
|---|---|---|
| `Section` | No fill, no box. A hairline (`rule`) on one edge and vertical padding | Any block of content on the page |
| `Panel` | `surface-elevated`, `rule` border, 12px corners, no shadow | The one raised thing: a form, the next step |

Props: `Section` takes `rule` (`top`, `bottom`, `none`) and `padding` (`none`, `normal`, `large`); `Panel` takes `padding`
(`none`, `small`, `normal`, `large`). Sections do not nest inside Panels, and a screen should not need more than one or two Panels.

Retired: the old `Card` and its `glass` and `inset` variants, `glow` shadows, the pulsing glow animation and
`accent-border-top`. Frosted translucency stays only where content scrolls under a sticky bar or a sheet scrim.

## Buttons and controls

| Button variant | Looks like | Use it for |
|---|---|---|
| `primary` | Filled Signal, Press text | The one main action on a screen |
| `secondary` | Transparent, `edge` border, Folio text | Other actions, such as "Add" or "Import" |
| `text` | No fill or border, `ink-secondary` text | Cancel, Back and quiet actions |
| `danger` | Filled Brick, Press text | The confirm step of a destructive action only |

Inputs, textareas, selects, the Roadmap check box and the toggle chips take their border from `edge` (3:1 against the page
and a Panel) over a `surface-subtle` fill. `rule` is for decoration only, never for the edge of something you operate.
Focus shows as a Signal border plus a 2px Signal ring. Every control is at least 44px tall.

## Tool icons

A workbench is recognised by its phase number and one line icon in Folio (`text-ink-primary`), with no tinted tile. The
registry (`src/workbenches/registry.ts`) carries no colour fields, so a tool can never bring its own hue, and a colour
keeps one meaning (Signal is progress, Clock is time, Brick is wrong).

The Workbenches screen is a contents list (`src/workbenches/ToolList.tsx`), not a grid of tiles: a serif numeral, the
tool's title, "Phase N · what it is for" (the registry's `blurb`), and a chevron, each row separated by a rule. The
numeral stands in for the icon there; the icon appears in the tool's own header.

A small Signal dot sits before the chevron when the tool holds something the person entered. It is Signal, not Clock,
because it says "there is work here" and Clock means time only. `toolHoldsData()` (`src/lib/workbenchData.ts`) decides:
a tool holds data when its saved value, run through its own normalizer, differs from a fresh start. So a field typed and
then cleared shows no dot, and Brief Builder's saved-at stamp is ignored. The dot is hidden from assistive tech and the
row's second line carries ", has saved data" for screen readers instead.

A tool opens on one hairline bar (back, the tool's icon, its title with the phase beneath, share), a one-line
description, then the tool itself in a single `Panel`. There is no glass, no shadow and no rounded header, and the title
wraps rather than truncating. The tool bodies inside the panel still carry their own headings and nested boxes; they are
the next thing to convert.

## Status mark and the Audit

`StatusMark` (`src/components/StatusMark.tsx`) is the one way the app shows "how far along": a solid Signal disc with a
tick when done, a Signal ring with a dot while under way, a hollow `edge` ring before. The Roadmap's spine nodes and the
Audit's rows use it, so the same shape means the same thing on both. It is decorative; the screen says the state in
words next to it.

The Audit leads with readiness, the thing a person can change, and states coverage once, as a sentence ("All 10
job-description lines are covered by a phase"), because coverage is a fact about how the curriculum was designed. Each
line is a row: the mark, the line's ID in mono, a serif readiness figure on the right, the requirement, "Served by
Phase 1", and a readiness bar. `readinessState()` (`src/lib/progress.ts`) picks the mark from the readiness percent: a
tick only at 100, so a line at 0% shows a hollow ring and never a tick. The bar carries `role="progressbar"` with its
value; the visible figure is hidden from assistive tech so it is not read twice. A line no phase serves (a state the
current data never reaches) shows Brick text, "Gap", and a "Review roadmap" button instead of a bar.

## Hours strip

`HoursStrip` (`src/components/HoursStrip.tsx`) draws progress as a length, never a ring: one segment per phase, as wide
as the phase's `hoursMax`, filled by that phase's own progress. A long phase looks long, so a small gain on a big phase
explains itself.

| Part | Looks like | Means |
|---|---|---|
| Width | Phase hours over total hours, gaps taken off the total | How big the phase is |
| Fill | `accent`, from the left edge | The phase's progress percent. A completed phase always reads full |
| Edge | `accent` on done and current phases, `edge` on the rest | Where you are |
| Tick | A 2px `clock` bar on the current phase | Tracked hours, as a share of that phase's hours |
| Number | `text-kicker` under the segment; `ink-primary` for the current phase | The phase number |

The layout is `src/lib/hoursStrip.ts`. It calls `phaseProgress()` itself, so the filled length always equals the overall
hours-weighted progress; `src/lib/hoursStrip.test.ts` checks that against `overallProgress()` on the real curriculum.
Each segment is an image with a spoken description ("Phase 3, 40% done, 16 hours, current phase") and the numbers are
decoration. The fill is static for now: the draw-in animation belongs to the P3 motion pass.

Passing `onSelect` makes it a table of contents (the Roadmap does): each segment gets a button, "Go to Phase 3, 40% done,
16 hours", that reports the phase id, and the drawn segments are hidden from assistive tech so nothing is read twice. The
buttons are 44px tall and sit over the segments in the same flex model, so each lines up with the phase it names.

The narrowest phases cannot be 44px wide: Phase 1 is about 5% of the strip, so roughly 15px at 360px. Each button
therefore runs from the midpoint between its neighbour's centre and its own to the midpoint on the other side
(`hitPercent` in `hoursStrip.ts`; the cells add up to 100% and each contains its own segment's centre). Wide phases get
wide targets, narrow phases get the most the strip can give them, and a tap can never land between two phases. WCAG 2.5.8
allows the smaller size because the same destination is on the screen as a full-size control: every phase row is a
heading button that does the same thing. The strip is a shortcut, never the only way.

## Not yet converted (planned for P2)

The Dashboard and the Roadmap now follow this system. These screens still use their own boxes and need the P2 layouts:
the Workbench tiles and the Audit donut and line cards.
