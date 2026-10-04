import type { Doc } from "@haystack/backend/convex/_generated/dataModel";
import { SPORTS, sportLabel } from "@haystack/backend/convex/sports";
import { Link } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme, useWindowDimensions } from "react-native";

// Same palette as apps/web/src/styles.css.
const light = { bg: "#f5f7f8", card: "#ffffff", text: "#1d1f24", muted: "#67717a", accent: "#0b8a4a", onAccent: "#ffffff", pill: "#e6eaed" };
const dark = { bg: "#232323", card: "#191919", text: "#ffffff", muted: "#b4b4b4", accent: "#2fcf7a", onAccent: "#0c1f14", pill: "#4a4a4a" };
export const useColors = () => (useColorScheme() === "dark" ? dark : light);

type Article = Doc<"articles">;

export function SportPills({ active, onChange }: { active?: string; onChange: (sport?: string) => void }) {
  const c = useColors();
  const pills = [{ slug: undefined, label: "Tudo" }, ...SPORTS];
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
            style={[styles.pill, { backgroundColor: on ? c.accent : c.pill }]}
          >
            <Text style={[styles.pillText, { color: on ? c.onAccent : c.text }]}>{s.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Tag({ sport }: { sport: string }) {
  const c = useColors();
  return (
    <Text style={[styles.tag, { backgroundColor: c.accent, color: c.onAccent }]}>{sportLabel(sport).toUpperCase()}</Text>
  );
}

/** Horizontal carousel of photo cards with the headline over the image. */
export function Highlights({ articles }: { articles: Article[] }) {
  const width = useWindowDimensions().width - 48;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={width + 12}
      decelerationRate="fast"
      style={{ marginHorizontal: -16 }}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
    >
      {articles.map((a) => (
        <Link key={a._id} href={{ pathname: "/article/[id]", params: { id: a._id } }} asChild>
          <Pressable style={({ pressed }) => [styles.highlight, { width, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
            <Image source={{ uri: a.imageUrl }} style={StyleSheet.absoluteFill} />
            <View style={styles.scrim}>
              <Tag sport={a.sport} />
              <Text style={styles.highlightTitle} numberOfLines={3}>
                {a.title}
              </Text>
              <Text style={styles.highlightMeta}>
                <Text style={{ fontWeight: "600", color: "#fff" }}>{a.source}</Text>  {timeAgo(a.publishedAt)}
              </Text>
            </View>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

/** List row: thumbnail on the leading side, tag + headline + meta. */
export function ArticleRow({ article }: { article: Article }) {
  const c = useColors();
  return (
    <Link href={{ pathname: "/article/[id]", params: { id: article._id } }} asChild>
      <Pressable style={({ pressed }) => [styles.row, { backgroundColor: c.card, opacity: pressed ? 0.7 : 1 }]}>
        <Image source={{ uri: article.imageUrl }} style={styles.thumb} />
        <View style={{ flex: 1, gap: 6 }}>
          <Tag sport={article.sport} />
          <Text style={[styles.title, { color: c.text }]} numberOfLines={3}>
            {article.title}
          </Text>
          <Text style={[styles.meta, { color: c.muted }]}>
            <Text style={{ fontWeight: "600", color: c.text }}>{article.source}</Text>  {timeAgo(article.publishedAt)}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export function timeAgo(ms: number) {
  const min = Math.round((Date.now() - ms) / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} ${h === 1 ? "hora" : "horas"}`;
  const d = Math.round(h / 24);
  if (d < 7) return `há ${d} ${d === 1 ? "dia" : "dias"}`;
  return new Date(ms).toLocaleDateString("pt-BR");
}

export const styles = StyleSheet.create({
  pills: { gap: 8, paddingBottom: 4 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderCurve: "continuous" },
  pillText: { fontSize: 15, fontWeight: "500" },
  tag: { alignSelf: "flex-start", overflow: "hidden", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, fontSize: 11, fontWeight: "700", letterSpacing: 0.6 },
  highlight: { height: 300, borderRadius: 16, overflow: "hidden", borderCurve: "continuous", justifyContent: "flex-end" },
  scrim: { padding: 18, gap: 8, backgroundColor: "rgba(0,0,0,0.55)" },
  highlightTitle: { color: "#fff", fontSize: 22, fontWeight: "700", letterSpacing: -0.4, lineHeight: 26 },
  highlightMeta: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  section: { fontSize: 26, fontWeight: "700", letterSpacing: -0.6, marginTop: 8 },
  row: { flexDirection: "row", gap: 14, padding: 12, borderRadius: 16, borderCurve: "continuous" },
  thumb: { width: 96, height: 96, borderRadius: 12 },
  title: { fontSize: 17, fontWeight: "600", letterSpacing: -0.3, lineHeight: 21 },
  summary: { fontSize: 16, lineHeight: 22 },
  meta: { fontSize: 13 },
});
