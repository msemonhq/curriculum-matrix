# Bundled fonts

The app ships its own fonts so it looks the same offline and makes no request to a third party at launch.

| File | Family | Axis |
|---|---|---|
| `Geist-Variable.woff2` | Geist | weight 100 to 900 |
| `GeistMono-Variable.woff2` | Geist Mono | weight 100 to 900 |

Source: https://github.com/vercel/geist-font at commit `10dc7658f13c38a474cde201bb09a4617267545b`
(`fonts/Geist/webfonts/Geist[wght].woff2` and `fonts/GeistMono/webfonts/GeistMono[wght].woff2`).
The files were renamed only to avoid brackets in the file name.

License: SIL Open Font License 1.1, in `OFL.txt` next to the fonts. The license has to travel with the font files.

They are declared with `@font-face` in `src/index.css` and referenced by relative path, so the Vite build fails if a
file goes missing. `scripts/self-hosted-fonts.test.mjs` also checks that nothing loads fonts from a remote host.
