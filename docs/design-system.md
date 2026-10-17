# Design system: The Ledger

The look is an analyst's working book: content on the page, separated by hairlines, with serif figures and one raised
surface for things you can act on. The source of truth for every value below is `tailwind.config.js`;
`scripts/design-tokens.test.mjs` fails if this page and the config drift apart.

## Principles

1. **Say it once.** One title per screen, one primary button per screen, one status per phase.
2. **Rules over boxes.** A raised surface means "you can type or tap here".
3. **Color is a unit.** Signal is progress and the action. Clock is time. Brick is destructive or wrong. Baize is a finished deliverable.
4. **12px is the floor.** Sentence case everywhere (no `uppercase` or wide tracking; the test fails on them); serif only for figures and titles.

## Colour

Seven named colours. Every other tone is Folio blended over Press or Graphite, and the test recomputes each one.

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
| `done` | Baize `#52D681` | A finished deliverable: the Dashboard's Deliverables icon. A green you can tell from Signal at a glance |
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

## Header

One bar on every screen: the 28px mark (it moves to the active tab's square), "Rokomari BSPR" in the title face, and a
hairline under it. On Workbenches and Audit it also carries a resume chip (`ResumeChip`) with the phase you are on and its
progress, "Phase 2 · 67%", which opens the Roadmap on that phase. It stays off the Dashboard and the Roadmap, which already
show that phase, off a tool's own screen, and off once the curriculum is complete. The chip is 44px tall; at 320px the
name wraps to two lines before it would meet the chip.

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

The strip appears on the Dashboard only. On the Roadmap it said what the phase rows below already say, so it was
removed there; a link carries you to a phase instead (see below).

## Dashboard and Roadmap

The Dashboard reads top to bottom as: the greeting and the budget line, the strip, three figures (Overall, Deliverables,
Hours logged), one "Up next" panel with its one button, then "Next steps". The strip and the figures say where you are;
Up next and Next steps say what to do, and they stay together because they are about the same phase. Each figure has a
16px icon in the same place: Signal for Overall (progress), Baize for Deliverables (finished work), Clock for hours.

"Next steps" lists the first three unticked core modules of the Up next phase as check rows (`nextModules()` in
`src/lib/progress.ts`). Ticking a row writes to the same store the Roadmap uses, so the strip, the Overall figure, the
summary line and the Continue/Start button move at once. A row ticked on this visit stays in the list so it can be
unticked, and the list refills to three; when every module is ticked it says so and points to the Roadmap, where a phase
is marked done. The check box is the shared `CheckMark` (`src/components/CheckMark.tsx`), the same one the Roadmap uses.

The Roadmap is the title, a pinned search and filter bar, and the spine. Each filter chip carries its count (All 8,
To do 6, Active 1, Done 1; `statusCounts()`), and the count follows the whole curriculum, not the search. The Continue/Start
button on the Dashboard opens the Roadmap on that phase (`src/lib/roadmapLink.ts` puts the phase id in the router's
location state): the phase opens, its row is brought under the pinned bar with an instant scroll, and its heading button
takes focus. An id that is not a phase, or a visit without one, changes nothing.

The spine runs down from the top of each phase and ends in that phase's status mark, so the mark sits where the phase
ends, below its text and any open detail. The line above a mark is Signal once the phase is completed, `rule` otherwise.
The mark's bottom edge is the row's bottom edge, so the next phase's line starts exactly where the mark ends.

## Empty states

`EmptyState` is text: a serif title, one line of explanation and, when there is something to do about it, one secondary
button. There is no illustration and no icon tile, because there is nothing to draw. The Roadmap's is "No phases match",
"Try a different search, or show every phase.", and a "Show all phases" button that clears the search and the filter. The
words are a live region so a screen reader hears the list go empty; the button sits outside it.

## Still to convert

Every screen's layout now follows this system. What is left is inside the eight workbench tools: their own headings,
descriptions that repeat the line shown above the panel (the AI verification log, for one), and boxes nested inside the
Panel. Convert them tool by tool, starting with the ones that show the most chrome before the first field.
