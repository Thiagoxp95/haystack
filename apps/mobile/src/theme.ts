import { useColorScheme } from "react-native";

// iOS system colors, checked against the MacMagazine screenshot.
const light = {
  bg: "#F2F2F7", // systemGroupedBackground
  card: "#FFFFFF",
  text: "#000000",
  meta: "#3A3A3C",
  muted: "#8E8E93",
  field: "rgba(118,118,128,0.12)",
  glass: "rgba(255,255,255,0.6)",
  glassSolid: "#F8F8F8",
  hairline: "rgba(0,0,0,0.14)",
  tabActive: "#383838",
  tabPill: "rgba(0,0,0,0.11)",
  heroButton: "rgba(150,150,150,0.8)",
  blurTint: "light" as "light" | "dark",
};

const dark: typeof light = {
  bg: "#000000",
  card: "#1C1C1E",
  text: "#FFFFFF",
  meta: "#D1D1D6",
  muted: "#8E8E93",
  field: "rgba(118,118,128,0.24)",
  glass: "rgba(40,40,42,0.6)",
  glassSolid: "#2C2C2E",
  hairline: "rgba(255,255,255,0.16)",
  tabActive: "#D1D1D6",
  tabPill: "rgba(255,255,255,0.16)",
  heroButton: "rgba(80,80,80,0.8)",
  blurTint: "dark",
};

export type Colors = typeof light;
export const useColors = () => (useColorScheme() === "dark" ? dark : light);

// Inter stands in for SF Pro (which may not ship on Android). Android ignores fontWeight on custom
// fonts, so each weight is its own family.
export const font = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};
