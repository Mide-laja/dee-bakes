import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        espresso: {
          DEFAULT: "#291B17",
          50: "#F5F1EF",
          100: "#E6DDDA",
          200: "#CCB8B1",
          300: "#A98E84",
          400: "#7A5E54",
          500: "#553B32",
          600: "#3D2721",
          700: "#291B17", // Primary Espresso
          800: "#1E1310",
          900: "#130B09",
          950: "#0C0706",
        },
        ivory: {
          DEFAULT: "#F6EFE5",
          50: "#FFFFFF",
          100: "#FDFBF7",
          200: "#F9F5EE",
          300: "#F6EFE5", // Warm Ivory
          400: "#ECE0D0",
          500: "#DECDB6",
        },
        caramel: {
          DEFAULT: "#A66D48",
          50: "#FAF3EE",
          100: "#F4E3D7",
          200: "#E7C4AD",
          300: "#D7A280",
          400: "#C1825B",
          500: "#A66D48", // Caramel
          600: "#8B5737",
          700: "#6F432A",
          800: "#573420",
          900: "#44291A",
        },
        sand: {
          DEFAULT: "#D1B18B",
          100: "#F7F2EB",
          200: "#EFE3D4",
          300: "#E4CEB6",
          400: "#D1B18B", // Sand
          500: "#B9946A",
        },
        cocoa: {
          DEFAULT: "#6C4030",
          100: "#ECDCD6",
          200: "#D6B5A9",
          300: "#B88673",
          400: "#925D4A",
          500: "#6C4030", // Cocoa
          600: "#553225",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(41, 27, 23, 0.08)',
        'warm-lg': '0 10px 30px -4px rgba(41, 27, 23, 0.12)',
        'caramel-glow': '0 0 25px -5px rgba(166, 109, 72, 0.3)',
      },
    },
  },
  plugins: [],
};
export default config;
