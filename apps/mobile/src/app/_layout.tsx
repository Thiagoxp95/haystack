import { ConvexProvider } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { convex } from "../convex";
import { usePushNotifications } from "../push";

export default function RootLayout() {
  usePushNotifications();
  return (
    <ConvexProvider client={convex}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerTransparent: Platform.OS === "ios",
          headerBlurEffect: "systemChromeMaterial",
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="index" options={{ title: "Haystack", headerLargeTitle: true }} />
        <Stack.Screen name="article/[id]" options={{ title: "" }} />
      </Stack>
    </ConvexProvider>
  );
}
