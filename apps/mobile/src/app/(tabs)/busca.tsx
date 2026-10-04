import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSearch } from "../../data";
import { font, useColors } from "../../theme";
import { HEADER_HEIGHT, PostList, Screen } from "../../ui";

export default function Search() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQuery(text.trim()), 350);
    return () => clearTimeout(t);
  }, [text]);
  const { data, error } = useSearch(query);
  const insets = useSafeAreaInsets();
  const c = useColors();
  const top = insets.top + 8 + HEADER_HEIGHT + 12;

  return (
    <Screen title="Buscar">
      <PostList
        topInset={top + 36 + 20}
        posts={query ? data : []}
        error={error}
        empty={query ? "Nenhum resultado." : "Busque por notícias do Esporte para Todos."}
      />
      <View
        style={{
          position: "absolute", top, left: 16, right: 16, height: 36, borderRadius: 18, zIndex: 1,
          flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, backgroundColor: c.field,
        }}
      >
        <Ionicons name="search" size={17} color={c.muted} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Buscar"
          placeholderTextColor={c.muted}
          returnKeyType="search"
          autoFocus
          style={{ flex: 1, padding: 0, color: c.text, fontFamily: font.regular, fontSize: 17 }}
        />
      </View>
    </Screen>
  );
}
