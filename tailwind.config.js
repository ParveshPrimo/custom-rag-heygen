import {nextui} from '@nextui-org/theme'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Barlowe', 'sans-serif'],
        mono: ["var(--font-geist-mono)"],
        unifraktur: ["var(--font-unifraktur-maguntia)"],
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
}
