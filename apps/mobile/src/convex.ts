import { ConvexReactClient } from "convex/react";

const url = process.env.EXPO_PUBLIC_CONVEX_URL;

/** null when no backend is configured: the app then reads WordPress directly (see data.ts). */
export const convex = url ? new ConvexReactClient(url) : null;
