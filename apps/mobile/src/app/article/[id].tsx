import { api } from "@haystack/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Tag, styles, timeAgo, useColors } from "../../ui";

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = useQuery(api.articles.get, { id });
  const c = useColors();

  if (article === undefined) return <ActivityIndicator style={{ flex: 1, backgroundColor: c.bg }} />;
  if (article === null)
    return <Text style={{ flex: 1, padding: 32, color: c.muted, backgroundColor: c.bg }}>Notícia não encontrada.</Text>;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: c.bg }}>
      <View style={{ padding: 20, gap: 12 }}>
        <Tag sport={article.sport} />
        <Text style={{ fontSize: 30, fontWeight: "700", letterSpacing: -0.6, lineHeight: 34, color: c.text }}>{article.title}</Text>
        <Text style={[styles.summary, { color: c.muted, fontSize: 18, lineHeight: 25 }]}>{article.summary}</Text>
        <Text style={[styles.meta, { color: c.muted }]}>
          <Text style={{ fontWeight: "600", color: c.text }}>{article.source}</Text>  {timeAgo(article.publishedAt)}
        </Text>
        <Image source={{ uri: article.imageUrl }} style={{ aspectRatio: 16 / 9, borderRadius: 16, marginVertical: 8 }} />
        {article.body.split("\n\n").filter(Boolean).map((p, i) => (
          <Text key={i} style={{ fontSize: 17, lineHeight: 27, color: c.text }}>
            {p}
          </Text>
        ))}
        <Pressable onPress={() => Linking.openURL(article.url)} accessibilityRole="link" style={{ paddingVertical: 12 }}>
          <Text style={{ color: c.accent, fontSize: 17, fontWeight: "600" }}>Leia a matéria completa em {article.source} →</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
