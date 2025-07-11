import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bloom: {
          primary: '#183a1d',
          secondary: '#f0a04b',
          primaryLight: '#245a2a',
          primaryDark: '#0f2412',
          secondaryLight: '#f4b56f',
          secondaryDark: '#d68a35',
        },
        background: "white",
        foreground: "#1f2937",
        border: "#e5e7eb",
        input: "#f9fafb",
        ring: "#183a1d",
        primary: {
          DEFAULT: "#183a1d",
          foreground: "white"
        },
        secondary: {
          DEFAULT: "#f0a04b",
          foreground: "white"
        },
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#6b7280"
        },
        accent: {
          DEFAULT: "#f3f4f6",
          foreground: "#1f2937"
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "white"
        },
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Cormorant Infant', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config