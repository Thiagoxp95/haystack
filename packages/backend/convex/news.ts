import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction, internalMutation } from "./_generated/server";
import { SPORTS } from "./sports";

const BREAKING_WINDOW_MS = 2 * 60 * 60_000; // new + published in the last 2h = breaking
const MAX_PUSHES_PER_REFRESH = 3;

const articleFields = {
  title: v.string(),
  summary: v.string(),
  body: v.string(),
  sport: v.string(),
  source: v.string(),
  imageUrl: v.string(),
  publishedAt: v.number(),
  url: v.string(),
};

/** `npx convex run news:refresh` — also runs on a cron (see crons.ts). */
export const refresh = internalAction({
  args: {},
  handler: async (ctx): Promise<{ fetched: number; inserted: number; breaking: number; failed: string[] }> => {
    const results = await Promise.allSettled(
      SPORTS.map(async ({ slug, feed }) => {
        const res = await fetch(feed, { headers: { "User-Agent": "Haystack/1.0" } });
        if (!res.ok) throw new Error(`${feed}: HTTP ${res.status}`);
        return parseRss(await res.text(), slug);
      }),
    );
    const articles = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    const failed = results.flatMap((r) => (r.status === "rejected" ? [String(r.reason)] : []));

    // Explicit type: Convex can't infer a function's return type when it calls back into `internal` itself.
    const inserted: { _id: Id<"articles">; title: string; sport: string; publishedAt: number }[] =
      await ctx.runMutation(internal.news.upsert, { articles });

    const breaking = inserted
      .filter((a) => a.publishedAt > Date.now() - BREAKING_WINDOW_MS)
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .slice(0, MAX_PUSHES_PER_REFRESH);
    if (breaking.length > 0) {
      await ctx.runAction(internal.push.sendBreaking, {
        articles: breaking.map(({ _id, title, sport }) => ({ id: _id, title, sport })),
      });
    }

    return { fetched: articles.length, inserted: inserted.length, breaking: breaking.length, failed };
  },
});

/** Insert new articles (keyed on url), refresh existing ones. Returns only the new ones. */
export const upsert = internalMutation({
  args: { articles: v.array(v.object(articleFields)) },
  handler: async (ctx, { articles }) => {
    const inserted = [];
    for (const a of articles) {
      const existing = await ctx.db
        .query("articles")
        .withIndex("by_url", (q) => q.eq("url", a.url))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, { title: a.title, summary: a.summary });
      } else {
        inserted.push({ _id: await ctx.db.insert("articles", a), ...a });
      }
    }
    return inserted;
  },
});

// ponytail: regex RSS parsing — fine for ESPN's flat RSS 2.0; swap in an XML parser for Atom or nested feeds.
export function parseRss(xml: string, sport: string) {
  return xml
    .split("<item>")
    .slice(1)
    .slice(0, 25)
    .flatMap((item) => {
      const title = tag(item, "title");
      const url = tag(item, "link");
      if (!title || !url) return [];
      const summary = tag(item, "description") ?? "";
      // Clamp: some feeds publish slightly future-dated items, which would pin them to the top.
      const publishedAt = Math.min(Date.parse(tag(item, "pubDate") ?? "") || Date.now(), Date.now());
      const id = url.match(/id\/(\d+)/)?.[1] ?? encodeURIComponent(url).slice(-40);
      return [
        {
          title,
          summary,
          body: "", // RSS carries only a summary; the article page links to the source.
          sport,
          source: "ESPN",
          // ponytail: ESPN RSS has no images — placeholder per story. Fetch og:image if you need real photos.
          imageUrl: `https://picsum.photos/seed/espn-${id}/1200/800`,
          publishedAt,
          url,
        },
      ];
    });
}

function tag(xml: string, name: string) {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  if (!m) return undefined;
  return decode(m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1")).trim();
}

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
