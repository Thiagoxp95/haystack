import type { Doc } from "@haystack/backend/convex/_generated/dataModel";
import { SPORTS, sportLabel } from "@haystack/backend/convex/sports";
import { Link } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";

// iOS system colors.
const light = { bg: "#f2f2f7", card: "#ffffff", text: "#000000", muted: "#8e8e93", accent: "#007aff", pill: "#e5e5ea" };
const dark = { bg: "#000000", card: "#1c1c1e", text: "#ffffff", muted: "#8e8e93", accent: "#0a84ff", pill: "#2c2c2e" };
export const useColors = () => (useColorScheme() === "dark" ? dark : light);

export function SportPills({ active, onChange }: { active?: string; onChange: (sport?: string) => void }) {
  const c = useColors();
  const pills = [{ slug: undefined, label: "All" }, ...SPORTS];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
      {pills.map((s) => {
        const on = s.slug === active;
        return (
          <Pressable
            key={s.label}
            onPress={() => onChange(s.slug)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[styles.pill, { backgroundColor: on ? c.text : c.pill }]}
          >
            <Text style={[styles.pillText, { color: on ? c.bg : c.text }]}>{s.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function ArticleCard({ article, large }: { article: Doc<"articles">; large?: boolean }) {
  const c = useColors();
  return (
    <Link href={{ pathname: "/article/[id]", params: { id: article._id } }} asChild>
      <Pressable style={({ pressed }) => [styles.card, { backgroundColor: c.card, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
        <Image source={{ uri: article.imageUrl }} style={{ aspectRatio: large ? 4 / 3 : 16 / 9 }} />
        <View style={styles.cardText}>
          <Text style={[styles.eyebrow, { color: c.accent }]}>{sportLabel(article.sport)}</Text>
          <Text style={[large ? styles.titleLarge : styles.title, { color: c.text }]}>{article.title}</Text>
          {large && <Text style={[styles.summary, { color: c.muted }]}>{article.summary}</Text>}
          <Text style={[styles.meta, { color: c.muted }]}>
            {article.source} · {timeAgo(article.publishedAt)}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export function timeAgo(ms: number) {
  const min = Math.round((Date.now() - ms) / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  if (min < 24 * 60) return `${Math.round(min / 60)}h ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const styles = StyleSheet.create({
  pills: { gap: 8, paddingBottom: 4 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  pillText: { fontSize: 15, fontWeight: "500" },
  card: { borderRadius: 20, overflow: "hidden", borderCurve: "continuous" },
  cardText: { padding: 16, gap: 4 },
  eyebrow: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  title: { fontSize: 19, fontWeight: "600", letterSpacing: -0.3 },
  titleLarge: { fontSize: 26, fontWeight: "700", letterSpacing: -0.5 },
  summary: { fontSize: 16, lineHeight: 22 },
  meta: { fontSize: 13, marginTop: 4 },
});
