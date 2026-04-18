import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      colors: {
        paper: "#F5F0E8",
        ink: "#1A1A1A",
        muted: "#8A8A8A",
        accent: "#C8A96E",
      },
    },
  },
  plugins: [],
};

export default config;
