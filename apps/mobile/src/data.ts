import { api } from "@haystack/backend/convex/_generated/api";
import { fetchCategories, fetchPost, fetchPosts, type Category, type Post } from "@haystack/backend/convex/wp";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { convex } from "./convex";

export type { Category, Post };
export type Loaded<T> = { data?: T; error?: Error };

/** Runs `load` once per `key`; `key: null` skips. Plain fetch state for the WordPress-direct path. */
function useAsync<T>(load: () => Promise<T>, key: string | null): Loaded<T> {
  const [state, setState] = useState<Loaded<T> & { key?: string | null }>({});
  useEffect(() => {
    if (key === null) return;
    let live = true;
    load().then(
      (data) => live && setState({ key, data }),
      (error: Error) => live && setState({ key, error }),
    );
    return () => {
      live = false;
    };
    // `key` encodes everything `load` closes over.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state.key === key ? state : {};
}

// The data source is fixed at build time, so each hook below is picked once at module load
// and the hook order never changes between renders.
const viaConvex = convex !== null;

/** Newest posts, optionally one WordPress category. */
export const useFeed: (categoryId?: number) => Loaded<Post[]> = viaConvex
  ? (categoryId) => ({ data: useQuery(api.articles.list, { categoryId, limit: 60 }) })
  : (categoryId) => useAsync(() => fetchPosts({ categoryId, perPage: 60 }), `feed:${categoryId ?? ""}`);

export const useCategories: () => Loaded<Category[]> = viaConvex
  ? () => ({ data: useQuery(api.articles.categories, {}) })
  : () => useAsync(fetchCategories, "categories");

/** One post. In Convex mode a post the mirror doesn't have yet (a fresh search hit) falls back to WordPress. */
export const usePost: (id: number) => Loaded<Post | null> = viaConvex
  ? (id) => {
      const mirrored = useQuery(api.articles.get, { id });
      const direct = useAsync(() => fetchPost(id), mirrored === null ? `post:${id}` : null);
      return mirrored === null ? direct : { data: mirrored };
    }
  : (id) => useAsync(() => fetchPost(id), `post:${id}`);

/** WordPress's own search, in both modes: it covers the whole archive. */
export const useSearch = (query: string) =>
  useAsync(() => fetchPosts({ search: query, perPage: 30 }), query ? `search:${query}` : null);
