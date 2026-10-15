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

## Not yet converted (planned for P2)

P1 changes the tokens, type and shared components. These screens still use their own boxes and need the P2 layouts:
the Dashboard ring, icon tiles and Quick wins block (which borrows `warning`, so Clock still appears outside time until
it is redesigned); the Roadmap phase cards and their `shadow-surface`; the Workbench tiles; the Audit donut and line cards.

