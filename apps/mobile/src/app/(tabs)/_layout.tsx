import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurTargetView, BlurView } from "expo-blur";
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from "expo-router/ui";
import { forwardRef, useRef, type ComponentProps, type RefObject } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { font, useColors } from "../../theme";

const TABS = [
  { name: "index", href: "/", label: "Notícias", icon: "newspaper" },
  { name: "categorias", href: "/categorias", label: "Categorias", icon: "grid" },
  { name: "favoritos", href: "/favoritos", label: "Favoritos", icon: "star" },
  { name: "ajustes", href: "/ajustes", label: "Ajustes", icon: "settings-sharp" },
] as const;

// iOS 26 floating tab bar: a glass pill with the tabs, plus a separate round search button.
// Content renders inside a BlurTargetView so the bar can blur what scrolls under it on Android.
export default function TabsLayout() {
  const target = useRef<View>(null);
  const insets = useSafeAreaInsets();
  return (
    <Tabs>
      <BlurTargetView ref={target} style={{ flex: 1 }}>
        <TabSlot />
      </BlurTargetView>
      {/* Route declarations only; the visible bar below renders its own triggers. */}
      <TabList style={{ display: "none" }}>
        {TABS.map((t) => (
          <TabTrigger key={t.name} name={t.name} href={t.href} />
        ))}
        <TabTrigger name="busca" href="/busca" />
      </TabList>
      <View pointerEvents="box-none" style={[styles.bar, { bottom: Math.max(insets.bottom, 21) }]}>
        <Glass target={target} style={styles.pill}>
          {TABS.map((t) => (
            <TabTrigger key={t.name} name={t.name} asChild>
              <TabButton label={t.label} icon={t.icon} />
            </TabTrigger>
          ))}
        </Glass>
        <TabTrigger name="busca" asChild>
          <SearchButton target={target} />
        </TabTrigger>
      </View>
    </Tabs>
  );
}

function Glass({ target, style, children }: { target: RefObject<View | null>; style: object; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={[style, styles.glassEdge, { borderColor: c.hairline }]}>
      <BlurView
        blurTarget={target}
        blurMethod="dimezisBlurView"
        intensity={60}
        tint={c.blurTint}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: c.glass }]} />
      {children}
    </View>
  );
}

type IconName = ComponentProps<typeof Ionicons>["name"];

const TabButton = forwardRef<View, TabTriggerSlotProps & { label: string; icon: IconName }>(
  function TabButton({ isFocused, label, icon, ...props }, ref) {
    const c = useColors();
    const color = isFocused ? c.tabActive : c.text;
    return (
      <Pressable
        ref={ref}
        {...props}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        style={[styles.tab, isFocused && { backgroundColor: c.tabPill }]}
      >
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    );
  },
);

const SearchButton = forwardRef<View, TabTriggerSlotProps & { target: RefObject<View | null> }>(
  function SearchButton({ isFocused, target, ...props }, ref) {
    const c = useColors();
    return (
      <Pressable ref={ref} {...props} accessibilityRole="tab" accessibilityLabel="Buscar" accessibilityState={{ selected: isFocused }}>
        <Glass target={target} style={styles.search}>
          <Ionicons name="search" size={26} color={isFocused ? c.tabActive : c.text} />
        </Glass>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  bar: { position: "absolute", left: 21, right: 20, flexDirection: "row", alignItems: "center", gap: 8 },
  glassEdge: { overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
  pill: { flex: 1, height: 62, borderRadius: 31, flexDirection: "row", padding: 4 },
  tab: { flex: 1, borderRadius: 27, alignItems: "center", justifyContent: "center", gap: 2 },
  tabLabel: { fontFamily: font.semibold, fontSize: 10, letterSpacing: 0.1 },
  search: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center" },
});
