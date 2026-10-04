import { router } from "expo-router";
import { useFeed } from "../../data";
import { GlassCircle, HeroCarousel, PostList, Screen } from "../../ui";

// NewsView.swift: 5 highlights in the carousel, the rest as cards below.
export default function News() {
  const { data, error } = useFeed();
  const highlights = data?.slice(0, 5) ?? [];

  return (
    <Screen
      title="Notícias"
      left={<GlassCircle icon="newspaper-outline" label="Categorias" onPress={() => router.navigate("/categorias")} />}
      right={<GlassCircle icon="star-outline" label="Favoritos" onPress={() => router.navigate("/favoritos")} />}
    >
      <PostList
        posts={data?.slice(5)}
        error={error}
        empty="Nenhuma notícia ainda."
        header={highlights.length > 0 ? <HeroCarousel posts={highlights} /> : null}
      />
    </Screen>
  );
}
