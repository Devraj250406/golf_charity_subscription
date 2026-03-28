import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Lumina Ledger Design System — from Stitch */
        primary: {
          DEFAULT: "#0054d6",
          dim: "#004abd",
          container: "#dae1ff",
          fixed: "#dae1ff",
          "fixed-dim": "#c7d3ff",
        },
        secondary: {
          DEFAULT: "#605f5e",
          dim: "#545353",
          container: "#e5e2e1",
          fixed: "#e5e2e1",
          "fixed-dim": "#d7d4d3",
        },
        tertiary: {
          DEFAULT: "#615b77",
          dim: "#554f6b",
          container: "#e1d8fa",
          fixed: "#e1d8fa",
          "fixed-dim": "#d3caeb",
        },
        surface: {
          DEFAULT: "#f9f9fc",
          bright: "#f9f9fc",
          dim: "#d3dbe4",
          variant: "#dde3eb",
          container: {
            DEFAULT: "#ebeef4",
            low: "#f2f3f8",
            lowest: "#ffffff",
            high: "#e4e8ef",
            highest: "#dde3eb",
          },
          tint: "#0054d6",
        },
        "on-primary": {
          DEFAULT: "#f8f7ff",
          container: "#0049bb",
          fixed: "#003894",
          "fixed-variant": "#0052d0",
        },
        "on-secondary": {
          DEFAULT: "#fcf8f7",
          container: "#525151",
          fixed: "#403f3f",
          "fixed-variant": "#5c5b5b",
        },
        "on-tertiary": {
          DEFAULT: "#fcf7ff",
          container: "#504b66",
          fixed: "#3d3852",
          "fixed-variant": "#5a5470",
        },
        "on-surface": {
          DEFAULT: "#2d3339",
          variant: "#596067",
        },
        "on-background": "#2d3339",
        background: "#f9f9fc",
        outline: {
          DEFAULT: "#757b83",
          variant: "#acb3ba",
        },
        error: {
          DEFAULT: "#9f403d",
          dim: "#4e0309",
          container: "#fe8983",
        },
        "on-error": {
          DEFAULT: "#fff7f6",
          container: "#752121",
        },
        inverse: {
          surface: "#0c0e11",
          "on-surface": "#9c9da0",
          primary: "#5e8bff",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": [
          "3.5rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "display-md": [
          "2.75rem",
          { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "display-sm": [
          "2.25rem",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        "headline-lg": [
          "1.75rem",
          { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "headline-md": [
          "1.5rem",
          { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "headline-sm": [
          "1.25rem",
          { lineHeight: "1.4", letterSpacing: "-0.005em", fontWeight: "600" },
        ],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "label-lg": [
          "0.875rem",
          {
            lineHeight: "1.4",
            letterSpacing: "0.03em",
            fontWeight: "500",
          },
        ],
        "label-md": [
          "0.75rem",
          {
            lineHeight: "1.4",
            letterSpacing: "0.05em",
            fontWeight: "500",
          },
        ],
        "label-sm": [
          "0.6875rem",
          {
            lineHeight: "1.4",
            letterSpacing: "0.05em",
            fontWeight: "500",
          },
        ],
      },
      borderRadius: {
        none: "0",
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      spacing: {
        "0.5": "0.175rem",
        "18": "4.5rem",
        "22": "5.5rem",
      },
      boxShadow: {
        ambient: "0 8px 40px rgba(45, 51, 57, 0.04)",
        "ambient-lg": "0 16px 80px rgba(45, 51, 57, 0.06)",
        glow: "0 0 4px rgba(0, 84, 214, 0.4)",
      },
      backdropBlur: {
        glass: "12px",
        "glass-lg": "20px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 4px rgba(0, 84, 214, 0.2)" },
          "50%": { boxShadow: "0 0 12px rgba(0, 84, 214, 0.4)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
