import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4fbf7",
          100: "#dcf4e4",
          200: "#bbe8cb",
          300: "#8fd7aa",
          400: "#5db980",
          500: "#3b9b61",
          600: "#2d7d4d",
          700: "#266240",
          800: "#224f36",
          900: "#1e412e"
        }
      },
      boxShadow: {
        soft: "0 10px 35px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
