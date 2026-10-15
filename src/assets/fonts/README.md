# Bundled fonts

The app ships its own fonts so it looks the same offline and makes no request to a third party at launch.
Each file is the upstream variable WOFF2, unmodified except for the file name (brackets removed).

| File | Family | Role | Axes |
|---|---|---|---|
| `Newsreader-Variable.woff2` | Newsreader | Display, Figure and Title (serif) | weight 200 to 800, optical size 6 to 72 |
| `HankenGrotesk-Variable.woff2` | Hanken Grotesk | Body, buttons, labels, forms | weight 100 to 900 |
| `JetBrainsMono-Variable.woff2` | JetBrains Mono | Data: line IDs, formulas, dates | weight 100 to 800 |

Newsreader's optical-size axis is applied by the browser from the font size (`font-optical-sizing: auto`), so the 20px
Title and the 40px Figure get different letterforms from one file.

## Provenance

| File | Source repository | Commit | Path in repository | SHA-256 |
|---|---|---|---|---|
| `Newsreader-Variable.woff2` | https://github.com/productiontype/Newsreader | `cfcb4f7af0e52c25e8df2a2431814c8e5fe2e155` | `fonts/variable/woff2/Newsreader[opsz,wght].woff2` | `1faa3380ac0e87e057b180e03fd94bd708a612afb67d2590677be4508909fae9` |
| `HankenGrotesk-Variable.woff2` | https://github.com/marcologous/hanken-grotesk | `eff37d18946b018ad239cf5fd3992db5d19b82a0` | `fonts/webfonts/HankenGrotesk[wght].woff2` | `170db667e22d3d138440de92431b2a4c7695ad06bef89354e59b25b4114dd7eb` |
| `JetBrainsMono-Variable.woff2` | https://github.com/JetBrains/JetBrainsMono | `19371302b95d218af43299bce79ddbddd0bc364d` | `fonts/webfonts/JetBrainsMono[wght].woff2` | `31ec365b93e4bad6f202ce23352a56d01ca4462b2afc782ed2cf6fa42ca9ac0e` |

## Licenses

All three are under the SIL Open Font License 1.1. The license has to travel with the font files:
`OFL-Newsreader.txt`, `OFL-HankenGrotesk.txt` and `OFL-JetBrainsMono.txt` are byte-identical copies of each
repository's `OFL.txt`.

## How they are used

They are declared with `@font-face` in `src/index.css` and referenced by relative path, so the Vite build fails if a
file goes missing. `scripts/self-hosted-fonts.test.mjs` also checks that nothing loads fonts from a remote host.
Latin only: Bangla is out of scope for now, so the font stacks have no Bengali fallback.
