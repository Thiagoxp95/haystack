import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { ConvexProvider } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { convex } from "../convex";
import { usePushNotifications } from "../push";
import { useColors } from "../theme";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const c = useColors();
  usePushNotifications();
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.bg).catch(() => {});
  }, [c.bg]);

  if (!fontsLoaded && !fontError) return null;

  const stack = <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />;
  return (
    <>
      <StatusBar style={c.blurTint === "dark" ? "light" : "dark"} />
      {convex ? <ConvexProvider client={convex}>{stack}</ConvexProvider> : stack}
    </>
  );
}
