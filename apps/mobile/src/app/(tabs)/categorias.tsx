import { router } from "expo-router";
import { ActivityIndicator, ScrollView, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCategories } from "../../data";
import { useColors } from "../../theme";
import { Group, HEADER_HEIGHT, Row, Screen, styles, TAB_BAR_SPACE } from "../../ui";

export default function Categories() {
  const { data, error } = useCategories();
  const insets = useSafeAreaInsets();
  const c = useColors();
  return (
    <Screen title="Categorias">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8 + HEADER_HEIGHT + 28, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
      >
        {error ? (
          <Text style={[styles.empty, { color: c.muted }]}>Não foi possível carregar as categorias.</Text>
        ) : !data ? (
          <ActivityIndicator style={{ marginTop: 48 }} />
        ) : (
          <Group>
            {data.map((cat, i) => (
              <Row
                key={cat.id}
                label={cat.name}
                detail={String(cat.count)}
                last={i === data.length - 1}
                onPress={() => router.push({ pathname: "/category/[id]", params: { id: String(cat.id), name: cat.name } })}
              />
            ))}
          </Group>
        )}
      </ScrollView>
    </Screen>
  );
}
