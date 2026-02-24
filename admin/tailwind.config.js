/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./main.jsx",
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./helpers/**/*.{js,jsx}",
    "./common/**/*.{js,jsx}",
    "./Context/**/*.{js,jsx}",
    "./store/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
