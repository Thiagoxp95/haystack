// The WordPress CMS behind Esporte para Todos. Imported by Convex (refresh), web and mobile (direct mode).
// Dependency-free on purpose: it runs in Convex, React Native and the browser.
export const WP_BASE_URL = "https://esporteparatodos.com";

const API = `${WP_BASE_URL}/wp-json/wp/v2`;
const EMBED = "author,wp:featuredmedia,wp:term";

export type Post = {
  id: number; // WordPress post id
  title: string;
  excerpt: string; // plain text
  body: string; // rendered HTML
  imageUrl: string; // "" when the post has no featured image
  author: string;
  category: string; // first category name, for labels and push titles
  categoryIds: number[];
  url: string;
  publishedAt: number; // ms since epoch
};

export type Category = { id: number; name: string; slug: string; count: number };

type WpPost = {
  id: number;
  date_gmt: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  _embedded?: {
    author?: { name?: string }[];
    "wp:featuredmedia"?: { source_url?: string; media_details?: { sizes?: Record<string, { source_url: string }> } }[];
    "wp:term"?: { id: number; name: string; taxonomy: string }[][];
  };
};

/** Newest first. `search` and `categoryId` map straight to WP's own query params. */
export async function fetchPosts(
  opts: { categoryId?: number; search?: string; page?: number; perPage?: number } = {},
): Promise<Post[]> {
  // Hand-built query string: React Native's URLSearchParams is incomplete.
  let q = `_embed=${EMBED}&per_page=${opts.perPage ?? 20}&page=${opts.page ?? 1}`;
  if (opts.categoryId) q += `&categories=${opts.categoryId}`;
  if (opts.search) q += `&search=${encodeURIComponent(opts.search)}`;
  const res = await fetch(`${API}/posts?${q}`);
  if (res.status === 400) return []; // WP answers 400 for a page past the end
  if (!res.ok) throw new Error(`WordPress posts: HTTP ${res.status}`);
  return ((await res.json()) as WpPost[]).map(toPost);
}

export async function fetchPost(id: number): Promise<Post | null> {
  const res = await fetch(`${API}/posts/${id}?_embed=${EMBED}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`WordPress post ${id}: HTTP ${res.status}`);
  return toPost((await res.json()) as WpPost);
}

/** Categories that have posts, alphabetical. */
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API}/categories?per_page=100&hide_empty=true&orderby=name`);
  if (!res.ok) throw new Error(`WordPress categories: HTTP ${res.status}`);
  const rows = (await res.json()) as { id: number; name: string; slug: string; count: number }[];
  return rows.map(({ id, name, slug, count }) => ({ id, name: decodeEntities(name), slug, count }));
}

export function toPost(p: WpPost): Post {
  const media = p._embedded?.["wp:featuredmedia"]?.[0];
  const sizes = media?.media_details?.sizes;
  const terms = p._embedded?.["wp:term"]?.flat().filter((t) => t.taxonomy === "category") ?? [];
  return {
    id: p.id,
    title: decodeEntities(p.title.rendered),
    excerpt: decodeEntities(stripTags(p.excerpt.rendered)).replace(/\s*\[…\]\s*$/, "…").trim(),
    body: p.content.rendered,
    imageUrl: (sizes?.large ?? sizes?.medium_large)?.source_url ?? media?.source_url ?? "",
    author: decodeEntities(p._embedded?.author?.[0]?.name ?? ""),
    category: decodeEntities(terms[0]?.name ?? ""),
    categoryIds: p.categories,
    url: p.link,
    // date_gmt has no zone suffix; it is UTC. Clamp future-dated (scheduled) posts to now.
    publishedAt: Math.min(Date.parse(`${p.date_gmt}Z`) || Date.now(), Date.now()),
  };
}

export const stripTags = (html: string) => html.replace(/<[^>]+>/g, "");

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…",
  ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", laquo: "«", raquo: "»",
};

/** WordPress titles arrive with numeric entities (&#8211;) and a few named ones (&amp;). */
export const decodeEntities = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] !== "#") return NAMED[e] ?? m;
    const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m;
  });
