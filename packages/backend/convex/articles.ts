import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import type { Category, Post } from "./wp";

const toPost = ({ _id, _creationTime, wpId, ...rest }: Doc<"articles">): Post => ({ id: wpId, ...rest });

/** Newest first, optionally one WP category. Bodies are left out: lists never render them. */
export const list = query({
  args: { categoryId: v.optional(v.number()), limit: v.optional(v.number()) },
  handler: async (ctx, { categoryId, limit }) => {
    const n = Math.min(limit ?? 50, 100);
    const newest = ctx.db.query("articles").withIndex("by_publishedAt").order("desc");
    const rows: Doc<"articles">[] = [];
    if (categoryId === undefined) rows.push(...(await newest.take(n)));
    else {
      // ponytail: scans the mirror newest-first; add an articleCategories index table if it grows past a few thousand posts.
      for await (const a of newest) {
        if (a.categoryIds.includes(categoryId)) rows.push(a);
        if (rows.length === n) break;
      }
    }
    return rows.map((a) => ({ ...toPost(a), body: "" }));
  },
});

/** One article by WordPress id, or null. */
export const get = query({
  args: { id: v.number() },
  handler: async (ctx, { id }) => {
    const a = await ctx.db
      .query("articles")
      .withIndex("by_wpId", (q) => q.eq("wpId", id))
      .unique();
    return a ? toPost(a) : null;
  },
});

export const categories = query({
  args: {},
  handler: async (ctx): Promise<Category[]> => {
    const rows = await ctx.db.query("categories").collect();
    return rows
      .map(({ wpId, name, slug, count }) => ({ id: wpId, name, slug, count }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  },
});
