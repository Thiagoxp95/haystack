import { useFavorites } from "../../favorites";
import { PostList, Screen } from "../../ui";

export default function Favorites() {
  const favorites = useFavorites();
  return (
    <Screen title="Favoritos">
      <PostList posts={favorites} empty="Nenhum favorito ainda. Toque em ••• numa notícia e escolha Favoritar." />
    </Screen>
  );
}
