// The Ledger palette: six named colours. Every other tone below is one of them, or Folio
// blended over Press/Graphite, so scripts/design-tokens.test.mjs can recompute and check it.
const PRESS = '#0B0D10'; // page
const GRAPHITE = '#151920'; // raised panel
const FOLIO = '#ECE8DF'; // ink
const SIGNAL = '#00C4DB'; // action, progress, complete
const CLOCK = '#F7941E'; // time
const BRICK = '#F87171'; // error, uncovered

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');
const dim = (hex) => `rgba(${rgb(hex)},0.15)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          base: PRESS,
          elevated: GRAPHITE,
          subtle: '#1E2128', // Folio 4% over Graphite: input and chip fills
          overlay: '#24272D', // Folio 7% over Graphite: hover fills, sheets
        },
        ink: {
          primary: FOLIO,
          secondary: '#ADABA5', // Folio 72% over Press
          tertiary: '#92908C', // Folio 60% over Press; still 4.5:1 on every surface
        },
        accent: { DEFAULT: SIGNAL, dim: dim(SIGNAL) },
        clock: { DEFAULT: CLOCK, dim: dim(CLOCK) },
        danger: { DEFAULT: BRICK, dim: dim(BRICK) },
        // Status words keep their names but borrow a palette colour: done is Signal, caution is Clock.
        success: { DEFAULT: SIGNAL, dim: dim(SIGNAL) },
        warning: { DEFAULT: CLOCK, dim: dim(CLOCK) },
        edge: '#696967', // Folio 42% over Press: borders of controls, 3:1 on Press and Graphite
        rule: '#2B2C2D', // Folio 14% over Press: hairlines and dividers
      },
      // Latin only for now: no Bengali fallback in the stacks.
      fontFamily: {
        sans: ['Hanken Grotesk', 'system-ui', 'sans-serif'], // UI: body, buttons, labels, forms
        serif: ['Newsreader', 'Georgia', 'serif'], // Display, Figure, Title (index.css applies it to those roles)
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'], // data: line IDs, formulas, dates
      },
      // Type roles. Display, Figure and Title are serif; Body, Meta and Kicker are sans. Nothing is smaller than 12px.
      fontSize: {
        display: ['2rem', { lineHeight: '2.25rem', fontWeight: '600' }], // 32/36, one per screen at most
        figure: ['2.5rem', { lineHeight: '2.5rem', fontWeight: '600' }], // 40/40, big numbers
        title: ['1.25rem', { lineHeight: '1.625rem', fontWeight: '600' }], // 20/26, cards and sheets
        body: ['0.9375rem', { lineHeight: '1.5rem' }], // 15/24, the default
        meta: ['0.8125rem', { lineHeight: '1.125rem' }], // 13/18, captions
        kicker: ['0.75rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.02em' }], // 12/16, small labels
      },
      borderRadius: { xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem' },
      spacing: {
        128: '32rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'app-nav': '5.5rem',
      },
      boxShadow: {
        'glow-accent': `0 0 16px rgba(${rgb(SIGNAL)},0.35)`,
        'glow-sm': `0 0 8px rgba(${rgb(SIGNAL)},0.25)`,
        surface: '0px 8px 24px rgba(0, 0, 0, 0.5)',
        'surface-lg': '0 8px 32px rgba(0,0,0,0.5)',
      },
      keyframes: {
        'pulse-glow': { '0%, 100%': { boxShadow: `0 0 8px rgba(${rgb(SIGNAL)},0.25)` }, '50%': { boxShadow: `0 0 24px rgba(${rgb(SIGNAL)},0.55)` } },
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: { 'pulse-glow': 'pulse-glow 2s ease-in-out infinite', 'fade-up': 'fade-up 0.3s ease-out' },
    },
  },
  plugins: [],
};
