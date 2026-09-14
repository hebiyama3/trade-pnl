import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Hiragino Sans",
          "Hiragino Kaku Gothic ProN",
          "Noto Sans JP",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        pnl: {
          pos: "#E6F3FF",
          "pos-fg": "#1D4ED8",
          neg: "#FFE6E6",
          "neg-fg": "#E11D48",
        },
      },
    },
  },
  plugins: [],
  safelist: [
    "bg-pnl-pos",
    "text-pnl-pos-fg",
    "bg-pnl-neg",
    "text-pnl-neg-fg",
    "border-sky-200",
    "border-rose-200",
  ],
};

export default config;
