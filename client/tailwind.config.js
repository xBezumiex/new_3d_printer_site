/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#050508',
          900: '#0a0a0f',
          800: '#0f0f18',
          700: '#161622',
          600: '#1e1e2e',
          500: '#252535',
        },
        warm: {
          100: '#f5f4f0',
          200: '#e8e6df',
          300: '#ccc9bf',
          400: '#a8a49a',
          500: '#7a7670',
        },
        ember: {
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
      },
      letterSpacing: {
        widest2: '0.25em',
        widest3: '0.35em',
      },
    },
  },
  plugins: [],
}
