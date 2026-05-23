import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#0d9488", light: "#14b8a6", dark: "#0f766e" },
        surface: "#0f172a",
        card: "#1e293b",
        border: "#334155",
        muted: "#64748b",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
