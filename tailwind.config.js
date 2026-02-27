/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}", // Catch-all just in case files are in root
  ],
  theme: {
    extend: {},
  },
  plugins: [
    typography,
  ],
}
