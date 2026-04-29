import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#050814",
        neon: {
          green: "#00FF85",
          cyan: "#00c3ff"
        }
      },
      boxShadow: {
        glow: "0 0 42px rgba(0, 255, 133, 0.18)",
        cyan: "0 0 52px rgba(0, 195, 255, 0.2)"
      },
      backgroundImage: {
        "neon-gradient": "linear-gradient(135deg, #00FF85 0%, #00c3ff 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))"
      }
    }
  },
  plugins: []
};

export default config;
