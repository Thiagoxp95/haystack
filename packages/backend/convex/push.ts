import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery, mutation } from "./_generated/server";

/** Called by the mobile app after it gets an Expo push token. `categories` (WP ids) empty/absent = all. */
export const register = mutation({
  args: { token: v.string(), categories: v.optional(v.array(v.number())) },
  handler: async (ctx, { token, categories }) => {
    if (!/^Expo(nent)?PushToken\[.+\]$/.test(token)) throw new Error("Not an Expo push token");
    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    // Omitting `categories` keeps the device's existing subscriptions (the app re-registers on every launch).
    if (existing) {
      if (categories !== undefined) await ctx.db.patch(existing._id, { categories });
    } else await ctx.db.insert("pushTokens", { token, categories });
  },
});

// ponytail: loads every token per send — fine to a few thousand devices; paginate past that.
export const allTokens = internalQuery({
  args: {},
  handler: (ctx) => ctx.db.query("pushTokens").collect(),
});

export const removeToken = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const row = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (row) await ctx.db.delete(row._id);
  },
});

/** Sends one push per (breaking article × subscribed device) via the Expo push API. */
export const sendBreaking = internalAction({
  args: {
    articles: v.array(
      v.object({ id: v.number(), title: v.string(), category: v.string(), categoryIds: v.array(v.number()) }),
    ),
  },
  handler: async (ctx, { articles }) => {
    const tokens = await ctx.runQuery(internal.push.allTokens, {});
    const messages = articles.flatMap((a) =>
      tokens
        .filter((t) => !t.categories?.length || t.categories.some((c) => a.categoryIds.includes(c)))
        .map((t) => ({
          to: t.token,
          title: a.category ? `Urgente · ${a.category}` : "Urgente",
          body: a.title,
          sound: "default",
          data: { articleId: String(a.id) }, // WP post id; the app opens /article/<id>
        })),
    );

    let sent = 0;
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100); // Expo accepts at most 100 per request
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          // Optional: only needed if you enable "enhanced push security" in your Expo project.
          ...(process.env.EXPO_ACCESS_TOKEN && {
            Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}`,
          }),
        },
        body: JSON.stringify(batch),
      });
      if (!res.ok) throw new Error(`Expo push failed: HTTP ${res.status} ${await res.text()}`);
      const { data } = (await res.json()) as {
        data: { status: "ok" | "error"; details?: { error?: string } }[];
      };
      for (const [j, ticket] of data.entries()) {
        if (ticket.status === "ok") sent++;
        else if (ticket.details?.error === "DeviceNotRegistered") {
          await ctx.runMutation(internal.push.removeToken, { token: batch[j].to });
        }
      }
    }
    return { sent };
  },
});
