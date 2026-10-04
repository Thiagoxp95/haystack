import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import { articleFields, categoryFields } from "./schema";
import { fetchCategories, fetchPosts } from "./wp";

const BREAKING_WINDOW_MS = 2 * 60 * 60_000; // new + published in the last 2h = breaking
const MAX_PUSHES_PER_REFRESH = 3;

type Inserted = { wpId: number; title: string; category: string; categoryIds: number[]; publishedAt: number };

/**
 * `npx convex run news:refresh` — mirrors the newest 100 WordPress posts (runs on a cron, see crons.ts).
 * Backfill the whole archive once with `npx convex run news:refresh '{"pages": 10}'`.
 */
export const refresh = internalAction({
  args: { pages: v.optional(v.number()) },
  handler: async (ctx, { pages = 1 }): Promise<{ fetched: number; inserted: number; breaking: number }> => {
    const categories = await fetchCategories();
    await ctx.runMutation(internal.news.saveCategories, {
      categories: categories.map(({ id, ...c }) => ({ wpId: id, ...c })),
    });

    let fetched = 0;
    const inserted: Inserted[] = [];
    for (let page = 1; page <= pages; page++) {
      const posts = await fetchPosts({ page, perPage: 100 });
      if (posts.length === 0) break;
      fetched += posts.length;
      // Explicit type: Convex can't infer a function's return type when it calls back into `internal` itself.
      const added: Inserted[] = await ctx.runMutation(internal.news.upsert, {
        articles: posts.map(({ id, ...p }) => ({ wpId: id, ...p })),
      });
      inserted.push(...added);
    }

    const breaking = inserted
      .filter((a) => a.publishedAt > Date.now() - BREAKING_WINDOW_MS)
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .slice(0, MAX_PUSHES_PER_REFRESH);
    if (breaking.length > 0) {
      await ctx.runAction(internal.push.sendBreaking, {
        articles: breaking.map(({ wpId, title, category, categoryIds }) => ({ id: wpId, title, category, categoryIds })),
      });
    }
    return { fetched, inserted: inserted.length, breaking: breaking.length };
  },
});

/** Insert new posts (keyed on wpId), overwrite existing ones (WP edits). Returns only the new ones. */
export const upsert = internalMutation({
  args: { articles: v.array(v.object(articleFields)) },
  handler: async (ctx, { articles }) => {
    const inserted: Inserted[] = [];
    for (const a of articles) {
      const existing = await ctx.db
        .query("articles")
        .withIndex("by_wpId", (q) => q.eq("wpId", a.wpId))
        .unique();
      if (existing) await ctx.db.replace(existing._id, a);
      else {
        await ctx.db.insert("articles", a);
        inserted.push(a);
      }
    }
    return inserted;
  },
});

export const saveCategories = internalMutation({
  args: { categories: v.array(v.object(categoryFields)) },
  handler: async (ctx, { categories }) => {
    const keep = new Set(categories.map((c) => c.wpId));
    for (const old of await ctx.db.query("categories").collect()) {
      if (!keep.has(old.wpId)) await ctx.db.delete(old._id);
    }
    for (const c of categories) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_wpId", (q) => q.eq("wpId", c.wpId))
        .unique();
      if (existing) await ctx.db.replace(existing._id, c);
      else await ctx.db.insert("categories", c);
    }
  },
});
