import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FDF8F6",
          muted: "#FAF3F0",
          deep: "#F5EBE6",
        },
        blush: {
          DEFAULT: "#E8B4BC",
          soft: "#F2D4D8",
          deep: "#D89CA6",
        },
        lilac: {
          DEFAULT: "#C4B5D4",
          soft: "#DDD4E8",
          deep: "#9E8AB8",
        },
        rosegold: {
          DEFAULT: "#C9A9A6",
          light: "#E8D5D0",
          accent: "#B76E79",
        },
        mint: {
          DEFAULT: "#B8D4C8",
          soft: "#D4E8DF",
          deep: "#8FB5A3",
        },
        mauve: {
          DEFAULT: "#5C4A5F",
          deep: "#3D3545",
          ink: "#2A2433",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(200, 160, 180, 0.25), 0 2px 8px -2px rgba(90, 70, 100, 0.08)",
        "soft-inner": "inset 0 1px 0 rgba(255, 255, 255, 0.6)",
        glow: "0 0 40px -8px rgba(232, 180, 188, 0.45)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
