/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Палитра сайта — тёмная с акцентом
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        surface: {
          dark: "#0a0a0f",
          card: "#12121a",
          border: "#1e1e2e",
          hover: "#1a1a28",
        },
        accent: {
          green: "#10b981",
          orange: "#f97316",
          purple: "#a855f7",
          gold: "#eab308",
        },
      },
    },
  },
  plugins: [],
}
