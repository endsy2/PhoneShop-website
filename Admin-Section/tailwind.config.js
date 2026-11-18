/** @type {import('tailwindcss').Config} */
// Genius Store design tokens: one grey ramp for every surface, the brand green as the only accent.
// User-Section/tailwind.config.js uses the same values; keep them in sync.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#fafafa",
        surface: "#ffffff",
        raised: "#f4f4f5",
        ink: { DEFAULT: "#171717", 2: "#525252", 3: "#737373" },
        line: "rgb(23 23 23 / 0.08)",
        "line-strong": "rgb(23 23 23 / 0.16)",
        // #4CAF4F from the logo, darkened so white text on it passes 4.5:1
        brand: { DEFAULT: "#2e7d32", hover: "#276b2b", soft: "#edf5ee" },
        danger: { DEFAULT: "#dc2626", soft: "#fdf0f0" },
        warn: "#b45309",
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.05)",
        float: "0 8px 24px rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};
