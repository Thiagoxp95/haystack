import { useLocalSearchParams } from "expo-router";
import { useFeed } from "../../data";
import { BackButton, PostList, Screen } from "../../ui";

export default function CategoryFeed() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { data, error } = useFeed(Number(id) || -1);
  return (
    <Screen title={name ?? "Categoria"} left={<BackButton />}>
      <PostList posts={data} error={error} empty="Nenhuma notícia nesta categoria." />
    </Screen>
  );
}
