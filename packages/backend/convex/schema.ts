import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  articles: defineTable({
    title: v.string(),
    summary: v.string(),
    body: v.string(),
    sport: v.string(), // a slug from SPORTS in ./sports.ts
    source: v.string(),
    imageUrl: v.string(),
    publishedAt: v.number(), // ms since epoch
    url: v.string(), // unique: the upsert key for RSS refresh
  })
    .index("by_sport", ["sport", "publishedAt"])
    .index("by_publishedAt", ["publishedAt"])
    .index("by_url", ["url"]),

  pushTokens: defineTable({
    token: v.string(), // ExponentPushToken[...]
    sports: v.optional(v.array(v.string())), // empty/absent = every sport
  }).index("by_token", ["token"]),
});
