import { WP_BASE_URL } from "@haystack/backend/convex/wp";
import Constants from "expo-constants";
import { Linking, ScrollView, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { convex } from "../../convex";
import { font, useColors } from "../../theme";
import { Group, HEADER_HEIGHT, Row, Screen, TAB_BAR_SPACE } from "../../ui";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  return (
    <Screen title="Ajustes">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8 + HEADER_HEIGHT + 28, paddingBottom: TAB_BAR_SPACE + insets.bottom, gap: 28 }}
      >
        <Group>
          <Row icon="notifications-outline" label="Notificações" onPress={() => Linking.openSettings()} />
          <Row icon="globe-outline" label="Abrir o site" onPress={() => Linking.openURL(WP_BASE_URL)} last />
        </Group>
        <Group>
          <Row label="Aparência" detail="Automática" />
          <Row label="Fonte" detail={convex ? "Convex" : "WordPress"} />
          <Row label="Versão" detail={Constants.expoConfig?.version ?? "—"} last />
        </Group>
        <Text style={{ textAlign: "center", color: c.muted, fontFamily: font.regular, fontSize: 13 }}>
          Esporte para Todos · {WP_BASE_URL.replace("https://", "")}
        </Text>
      </ScrollView>
    </Screen>
  );
}
