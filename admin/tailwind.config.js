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
    extend: {
      colors: {
        admin: {
          bg: '#020617',
          surface: '#0f172a',
          panel: '#1e293b',
          border: '#334155',
          muted: '#94a3b8',
          accent: '#eab308',
        },
      },
      boxShadow: {
        'admin-soft': '0 10px 25px rgba(2, 6, 23, 0.35)',
      },
    },
  },
  plugins: [],
}
