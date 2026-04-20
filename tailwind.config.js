/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Lato', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          light: '#e8d08a',
          DEFAULT: '#b5902a',
          dark: '#8a6d1e',
        },
        parchment: '#faf6ef',
        ink: '#2d1f3d',
      },
    },
  },
  plugins: [],
}
