/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
        parchment: {
          DEFAULT: '#faf6ef',
          dark: '#1a1421',
        },
        ink: {
          DEFAULT: '#2d1f3d',
          dark: '#e0d8eb',
        },
      },
    },
  },
  plugins: [],
}
