import { api } from "@haystack/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { ArticleRow, Highlights, SportPills, styles, useColors } from "../ui";

export default function Feed() {
  const [sport, setSport] = useState<string>();
  const articles = useQuery(api.articles.list, { sport });
  const c = useColors();
  const highlights = articles?.slice(0, 5) ?? [];
  const latest = articles?.slice(5) ?? [];

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={latest}
      keyExtractor={(a) => a._id}
      ListHeaderComponent={
        <View style={{ gap: 16 }}>
          <SportPills active={sport} onChange={setSport} />
          {highlights.length > 0 && <Highlights articles={highlights} />}
          {latest.length > 0 && <Text style={[styles.section, { color: c.text }]}>Últimas notícias</Text>}
        </View>
      }
      ListEmptyComponent={
        articles === undefined ? (
          <ActivityIndicator style={{ marginTop: 48 }} />
        ) : articles.length === 0 ? (
          <Text style={{ color: c.muted, textAlign: "center", marginTop: 48 }}>
            Nenhuma notícia ainda. Rode `pnpm --filter @haystack/backend seed`.
          </Text>
        ) : null
      }
      renderItem={({ item }) => <ArticleRow article={item} />}
    />
  );
}
