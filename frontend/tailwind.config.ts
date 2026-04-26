import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bark: "#6B4F3A",
        cream: "#FFF8EE",
        sky: "#DFF2FF",
      },
    },
  },
  plugins: [],
} satisfies Config;
