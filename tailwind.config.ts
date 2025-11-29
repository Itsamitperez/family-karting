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
        // Primary F1 Colors
        "electric-red": {
          DEFAULT: "#FF1E1E",
          dark: "#CC1818",
          light: "#FF4D4D",
        },
        "deep-charcoal": "#0D0D0F",
        "velocity-yellow": {
          DEFAULT: "#FFCE45",
          dark: "#E6B83E",
          light: "#FFD866",
        },
        "cyber-purple": {
          DEFAULT: "#7B61FF",
          dark: "#6250CC",
          light: "#9580FF",
        },
        // Secondary Colors
        "steel-gray": {
          DEFAULT: "#1E1F24",
          light: "#2A2B32",
          dark: "#141418",
        },
        "aqua-neon": {
          DEFAULT: "#00E5D4",
          dark: "#00B8AA",
          light: "#33EBDD",
        },
        "soft-white": "#FAFAFA",
        "green-lime": {
          DEFAULT: "#44FF80",
          dark: "#36CC66",
          light: "#66FF99",
        },
        // Panel Colors
        panel: {
          DEFAULT: "#141418",
          hover: "#23232A",
        },
        // Legacy support
        primary: {
          DEFAULT: "#FF1E1E",
          dark: "#CC1818",
          light: "#FF4D4D",
        },
        background: {
          DEFAULT: "#0D0D0F",
          secondary: "#1E1F24",
          tertiary: "#2A2B32",
        },
        accent: {
          DEFAULT: "#00E5D4",
          neon: "#44FF80",
        },
      },
      fontFamily: {
        f1: ["TelAviv", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "display-lg": ["4rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-xl": ["5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-2xl": ["6rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        "safe-top": "env(safe-area-inset-top, 0px)",
        "18": "4.5rem",
        "22": "5.5rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "glow-red": "0 0 20px rgba(255, 30, 30, 0.4), 0 0 40px rgba(255, 30, 30, 0.2)",
        "glow-aqua": "0 0 20px rgba(0, 229, 212, 0.4), 0 0 40px rgba(0, 229, 212, 0.2)",
        "glow-purple": "0 0 20px rgba(123, 97, 255, 0.4), 0 0 40px rgba(123, 97, 255, 0.2)",
        "glow-yellow": "0 0 20px rgba(255, 206, 69, 0.4), 0 0 40px rgba(255, 206, 69, 0.2)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.4)",
        "glass-hover": "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 30, 30, 0.1)",
      },
      backdropBlur: {
        "glass": "20px",
      },
      animation: {
        "slide-up": "slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "slide-in-right": "slide-in-right 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-in": "fade-in 0.3s ease forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
      keyframes: {
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 30, 30, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 30, 30, 0.6), 0 0 60px rgba(255, 30, 30, 0.3)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  plugins: [],
};

export default config;
