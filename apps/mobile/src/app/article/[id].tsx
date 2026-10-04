import { api } from "@haystack/backend/convex/_generated/api";
import { sportLabel } from "@haystack/backend/convex/sports";
import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { styles, timeAgo, useColors } from "../../ui";

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = useQuery(api.articles.get, { id });
  const c = useColors();

  if (article === undefined) return <ActivityIndicator style={{ flex: 1, backgroundColor: c.bg }} />;
  if (article === null)
    return <Text style={{ flex: 1, padding: 32, color: c.muted, backgroundColor: c.bg }}>Story not found.</Text>;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: c.bg }}>
      <Image source={{ uri: article.imageUrl }} style={{ aspectRatio: 4 / 3 }} />
      <View style={{ padding: 20, gap: 12 }}>
        <Text style={[styles.eyebrow, { color: c.accent }]}>{sportLabel(article.sport)}</Text>
        <Text style={{ fontSize: 32, fontWeight: "700", letterSpacing: -0.6, color: c.text }}>{article.title}</Text>
        <Text style={[styles.summary, { color: c.muted, fontSize: 19, lineHeight: 26 }]}>{article.summary}</Text>
        <Text style={[styles.meta, { color: c.muted }]}>
          {article.source} · {timeAgo(article.publishedAt)}
        </Text>
        {article.body.split("\n\n").filter(Boolean).map((p, i) => (
          <Text key={i} style={{ fontSize: 17, lineHeight: 26, color: c.text }}>
            {p}
          </Text>
        ))}
        <Pressable onPress={() => Linking.openURL(article.url)} accessibilityRole="link" style={{ paddingVertical: 12 }}>
          <Text style={{ color: c.accent, fontSize: 17, fontWeight: "600" }}>Read the full story at {article.source} →</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
