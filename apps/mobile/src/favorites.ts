import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import type { Post } from "./data";

// Favorites live on the device only. Snapshots (minus body) so the list renders offline.
const KEY = "favorites:v1";
let favorites: Post[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

AsyncStorage.getItem(KEY)
  .then((saved) => {
    if (!saved) return;
    favorites = JSON.parse(saved) as Post[];
    emit();
  })
  .catch(() => {}); // unreadable storage = no favorites, never a crash

export function toggleFavorite(post: Post) {
  favorites = favorites.some((f) => f.id === post.id)
    ? favorites.filter((f) => f.id !== post.id)
    : [{ ...post, body: "" }, ...favorites];
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify(favorites)).catch(() => {});
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useFavorites = () => useSyncExternalStore(subscribe, () => favorites);
export const useIsFavorite = (id: number) => useFavorites().some((f) => f.id === id);
