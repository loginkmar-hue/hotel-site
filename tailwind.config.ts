import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#faf7f2",
          100: "#f1e9dc",
          200: "#e3d2b6",
          300: "#d0b385",
          400: "#bd955c",
          500: "#a87a3f",
          600: "#8b6232",
          700: "#6e4d2a",
          800: "#523a22",
          900: "#3b2a1a",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
