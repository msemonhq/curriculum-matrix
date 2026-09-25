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
        // Surface system
        surface: {
          base:     '#0d0d0f',
          elevated: '#18181b',
          overlay:  '#1f1f23',
          subtle:   '#27272a',
        },
        // Brand accent
        accent: {
          DEFAULT: '#00c4db',
          dim:     'rgba(0,196,219,0.15)',
          glow:    'rgba(0,196,219,0.33)',
        },
        // Semantic
        success: {
          DEFAULT: '#22c55e',
          dim:     'rgba(34,197,94,0.15)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          dim:     'rgba(245,158,11,0.15)',
        },
        danger: {
          DEFAULT: '#f87171',
          dim:     'rgba(248,113,113,0.15)',
        },
        // Text
        ink: {
          primary:   '#fafafa',
          secondary: '#a1a1aa',
          tertiary:  '#52525b',
        },
        // Border
        line: {
          DEFAULT: '#3f3f46',
          focus:   '#00c4db',
        },
        // Legacy aliases (keep for backward compat during transition)
        rokomari: {
          teal:      '#00c4db',
          darkTeal:  '#009ab0',
          orange:    '#f7941e',
          darkOrange:'#c67618',
        },
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      fontSize: {
        'display': ['2rem',    { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        'heading':  ['1.5rem',  { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.015em' }],
        'title':    ['1.125rem',{ lineHeight: '1.4', fontWeight: '600' }],
        'body':     ['0.875rem',{ lineHeight: '1.6' }],
        'caption':  ['0.75rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.04em' }],
        'micro':    ['0.625rem',{ lineHeight: '1.2', fontWeight: '600', letterSpacing: '0.08em' }],
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      spacing: {
        '128': '32rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      boxShadow: {
        'glow-accent': '0 0 16px rgba(0,196,219,0.35)',
        'glow-sm':     '0 0 8px rgba(0,196,219,0.25)',
        'surface':     '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.24)',
        'surface-lg':  '0 8px 32px rgba(0,0,0,0.5)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,196,219,0.25)' },
          '50%':      { boxShadow: '0 0 24px rgba(0,196,219,0.55)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-up':    'fade-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
