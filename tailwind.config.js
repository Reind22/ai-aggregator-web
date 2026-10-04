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
        // Тёмная палитра с зелёным акцентом (Stake-зелёный)
        primary: {
          400: "#33FF33",
          500: "#00FF00",
          600: "#00CC00",
          700: "#00A000",
          800: "#008F00",
        },
        surface: {
          dark: "#08080c",     // фон страницы
          card: "#0d0d14",     // карточки
          border: "#1e1e30",   // границы
          hover: "#161622",    // ховер
        },
        accent: {
          green: "#00CC00",
          red: "#FF4444",
          gold: "#FFD700",
        },
      },
      fontFamily: {
        // GameStore использует Inter с весами до 800 — та же связка
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
}
