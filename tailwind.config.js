/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rokomari Brand colors
        rokomari: {
          teal: '#00a2b8',
          darkTeal: '#007f91',
          orange: '#f7941e',
          darkOrange: '#c67618',
        }
      }
    },
  },
  plugins: [],
}
