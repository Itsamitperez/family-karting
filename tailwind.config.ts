import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF1801",
          dark: "#CC1301",
          light: "#FF4D33",
        },
        background: {
          DEFAULT: "#0A0A0A",
          secondary: "#1A1A1A",
          tertiary: "#2A2A2A",
        },
        accent: {
          DEFAULT: "#00D4FF",
          neon: "#00FF88",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px #FF1801, 0 0 10px #FF1801" },
          "100%": { boxShadow: "0 0 10px #FF1801, 0 0 20px #FF1801, 0 0 30px #FF1801" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

