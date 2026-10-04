import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { SAMPLE_ARTICLES } from "./sampleArticles";

/** Newest first, optionally filtered to one sport. */
export const list = query({
  args: { sport: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { sport, limit }) => {
    const n = Math.min(limit ?? 50, 100);
    if (sport) {
      return await ctx.db
        .query("articles")
        .withIndex("by_sport", (q) => q.eq("sport", sport))
        .order("desc")
        .take(n);
    }
    return await ctx.db.query("articles").withIndex("by_publishedAt").order("desc").take(n);
  },
});

/** One article, or null if the id is unknown or malformed (route params are untrusted strings). */
export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const articleId = ctx.db.normalizeId("articles", id);
    return articleId ? await ctx.db.get(articleId) : null;
  },
});

/** `npx convex run articles:seed` — idempotent, keyed on url. */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    for (const [i, a] of SAMPLE_ARTICLES.entries()) {
      const exists = await ctx.db
        .query("articles")
        .withIndex("by_url", (q) => q.eq("url", a.url))
        .unique();
      if (exists) continue;
      // Stagger timestamps so the feed has a believable order.
      await ctx.db.insert("articles", { ...a, publishedAt: Date.now() - i * 47 * 60_000 });
      inserted++;
    }
    return { inserted };
  },
});
