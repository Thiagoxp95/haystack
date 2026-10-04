import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Mirrors `Post` in ./wp.ts, with the WordPress id stored as wpId.
export const articleFields = {
  wpId: v.number(),
  title: v.string(),
  excerpt: v.string(),
  body: v.string(), // rendered HTML
  imageUrl: v.string(),
  author: v.string(),
  category: v.string(),
  categoryIds: v.array(v.number()),
  url: v.string(),
  publishedAt: v.number(), // ms since epoch
};

export const categoryFields = { wpId: v.number(), name: v.string(), slug: v.string(), count: v.number() };

export default defineSchema({
  articles: defineTable(articleFields).index("by_wpId", ["wpId"]).index("by_publishedAt", ["publishedAt"]),

  categories: defineTable(categoryFields).index("by_wpId", ["wpId"]),

  pushTokens: defineTable({
    token: v.string(), // ExponentPushToken[...]
    categories: v.optional(v.array(v.number())), // WP category ids; empty/absent = every category
  }).index("by_token", ["token"]),
});
