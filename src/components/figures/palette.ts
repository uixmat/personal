/** Monotone tokens resolved to sRGB hex, for Three.js (which can't parse oklch). */
export interface Palette {
  accent: string;
  ink: string;
  ink2: string;
  ink3: string;
  paper: string;
  rule: string;
  ruleStrong: string;
  surface: string;
}

export const MONOTONE: Palette = {
  paper: "#080808",
  surface: "#121212",
  ink: "#f3f3f3",
  ink2: "#b4b4b4",
  ink3: "#8a8a8a",
  rule: "#262626",
  ruleStrong: "#3d3d3d",
  accent: "#63cbfe",
};
