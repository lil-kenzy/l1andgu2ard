import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "912px",
      lg: "1280px",
      xl: "1440px",
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        // Brand palette
        amber:  { DEFAULT: "#F59E0B", light: "#FCD34D", dark: "#D97706" },
        emerald: { DEFAULT: "#10B981", light: "#6EE7B7", dark: "#059669" },
        crimson: { DEFAULT: "#EF4444", light: "#FCA5A5", dark: "#DC2626" },
        navy:   { DEFAULT: "#0F172A", light: "#1E293B", dark: "#020617" },
      },
      fontFamily: {
        sans: ["Inter Variable", "Inter", "system-ui", "sans-serif"],
        heading: ["Inter Variable", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
        "glass-lg": "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.12)",
        "glass-hover": "0 24px 64px rgba(0,0,0,0.22), 0 6px 20px rgba(0,0,0,0.14)",
        "3d": "0 2px 4px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.06)",
      },
      backdropBlur: {
        glass: "20px",
        "glass-heavy": "40px",
      },
      keyframes: {
        stamp: {
          "0%":   { transform: "scale(2.5) rotate(-12deg)", opacity: "0" },
          "60%":  { transform: "scale(0.9) rotate(-12deg)", opacity: "1" },
          "80%":  { transform: "scale(1.05) rotate(-12deg)" },
          "100%": { transform: "scale(1) rotate(-12deg)", opacity: "1" },
        },
        "pin-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "30%":      { transform: "translateY(-14px)" },
          "60%":      { transform: "translateY(-6px)" },
          "80%":      { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "slide-up": {
          "0%":   { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%":   { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "upload-progress": {
          "0%":   { transform: "scaleX(0) rotateY(0deg)" },
          "50%":  { transform: "scaleX(0.6) rotateY(5deg)" },
          "100%": { transform: "scaleX(1) rotateY(0deg)" },
        },
        "pulse-ring": {
          "0%":   { boxShadow: "0 0 0 0 rgba(16,185,129,0.4)" },
          "70%":  { boxShadow: "0 0 0 10px rgba(16,185,129,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(16,185,129,0)" },
        },
      },
      animation: {
        stamp:           "stamp 0.5s cubic-bezier(0.22,0.61,0.36,1) forwards",
        "pin-bounce":    "pin-bounce 0.6s ease-in-out",
        shimmer:         "shimmer 2s linear infinite",
        "slide-up":      "slide-up 0.35s ease-out",
        "slide-down":    "slide-down 0.35s ease-out",
        "fade-in":       "fade-in 0.3s ease-out",
        "upload-progress":"upload-progress 1.5s ease-in-out",
        "pulse-ring":    "pulse-ring 1.5s ease-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;