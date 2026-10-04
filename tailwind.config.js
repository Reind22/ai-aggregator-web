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
        // Палитра в духе Stake: светло-серый фон + ярко-зелёный акцент
        primary: {
          50: "#E8F5E9",
          100: "#C8E6C9",
          400: "#33FF33",
          500: "#00FF00",
          600: "#00CC00",
          700: "#00A000",
        },
        surface: {
          dark: "#F0F0F0",     // фон страницы (светло-серый, лёгкий зелёный подтон)
          card: "#FFFFFF",     // карточки
          border: "#E0E0E0",   // границы
          hover: "#E8F5E9",    // ховер-подложка (светло-зелёная)
        },
        ink: {
          DEFAULT: "#1A1A1A",  // основной текст
          soft: "#666666",     // вторичный
          mute: "#999999",     // приглушённый
        },
        accent: {
          green: "#00CC00",
          red: "#FF4444",
          gold: "#FFD700",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
}
