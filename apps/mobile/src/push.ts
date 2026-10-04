import { api } from "@haystack/backend/convex/_generated/api";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { convex } from "./convex";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Asks permission, gets an Expo push token and saves it in Convex.
 * Pass `categories` (WordPress ids) to subscribe to specific ones; omit to keep the current subscription (default: all).
 */
export async function registerForPush(categories?: number[]) {
  if (!convex) return null; // push tokens are stored in Convex; WordPress-direct mode has nowhere to keep them
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Breaking news",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") ({ status } = await Notifications.requestPermissionsAsync());
  if (status !== "granted") return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn("Push disabled: no EAS projectId. Run `pnpm dlx eas-cli init` in apps/mobile.");
    return null;
  }
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await convex.mutation(api.push.register, { token, categories });
  return token;
}

/** Registers on launch and opens the article when a notification is tapped. */
export function usePushNotifications() {
  useEffect(() => {
    registerForPush().catch((e) => console.warn("Push registration failed:", e));

    const open = (n: Notifications.Notification) => {
      const id = n.request.content.data?.articleId;
      if (typeof id === "string") router.push({ pathname: "/article/[id]", params: { id } });
    };
    const last = Notifications.getLastNotificationResponse();
    if (last) open(last.notification);
    const sub = Notifications.addNotificationResponseReceivedListener((r) => open(r.notification));
    return () => sub.remove();
  }, []);
}
