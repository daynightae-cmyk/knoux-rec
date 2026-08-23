/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./hooks/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};