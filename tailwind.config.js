/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
        hand: ['"Caveat"', 'cursive'],
        body: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0B1957', // palette navy
        paper: '#F0EFE4', // palette cream
        base: '#070E2E', // deep navy background (darker shade of #0B1957)
        card: '#0B1957', // palette navy — cards
        acid: '#E3B02B', // palette gold — main accent
        forest: '#1A5D2A', // palette green
        cream: '#F0EFE4',
        // remap Tailwind's lime scale to the palette green so all
        // light-mode "success" classes pick it up automatically
        lime: {
          400: '#4c9b5e',
          500: '#2e7d45',
          600: '#1A5D2A',
          700: '#14481f',
        },
      },
    },
  },
  plugins: [],
}
