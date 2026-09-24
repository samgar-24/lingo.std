import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: { extend: { colors: { brand: { DEFAULT: "#97061F", dark: "#7A0518", soft: "#FBEEF0" } } } },
  plugins: [],
};
export default config;
