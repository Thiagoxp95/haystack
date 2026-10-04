import { api } from "@haystack/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";
import { ActivityIndicator, FlatList, Text } from "react-native";
import { ArticleCard, SportPills, useColors } from "../ui";

export default function Feed() {
  const [sport, setSport] = useState<string>();
  const articles = useQuery(api.articles.list, { sport });
  const c = useColors();

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      data={articles ?? []}
      keyExtractor={(a) => a._id}
      ListHeaderComponent={<SportPills active={sport} onChange={setSport} />}
      ListEmptyComponent={
        articles === undefined ? (
          <ActivityIndicator style={{ marginTop: 48 }} />
        ) : (
          <Text style={{ color: c.muted, textAlign: "center", marginTop: 48 }}>
            No stories yet. Run `pnpm --filter @haystack/backend seed`.
          </Text>
        )
      }
      renderItem={({ item, index }) => <ArticleCard article={item} large={index === 0} />}
    />
  );
}
