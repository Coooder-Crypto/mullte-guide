import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        muted: "var(--muted)",
        border: "var(--border)",
        accent: "var(--accent)",
        accentStrong: "var(--accent-strong)",
        accentSoft: "var(--accent-soft)",
        signalSoft: "var(--signal-soft)",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Avenir Next", "Segoe UI", "sans-serif"],
        mono: ["SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
