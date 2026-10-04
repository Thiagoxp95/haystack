// Every number here is copied from MacMagazine's SwiftUI source (github.com/MacMagazine/app-iOS,
// release/v5) and checked against the target screenshot. File names in comments point at the source.
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Post } from "./data";
import { toggleFavorite, useIsFavorite } from "./favorites";
import { font, useColors } from "./theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export const HEADER_HEIGHT = 44;
/** Space the floating tab bar covers at the bottom of every tab screen. */
export const TAB_BAR_SPACE = 62 + 21 + 24;

export function timeAgo(ms: number) {
  const min = Math.floor((Date.now() - ms) / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} ${min === 1 ? "minuto" : "minutos"}`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} ${h === 1 ? "hora" : "horas"}`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d} ${d === 1 ? "dia" : "dias"}`;
  return new Date(ms).toLocaleDateString("pt-BR");
}

export const openPost = (post: Post) =>
  router.push({ pathname: "/article/[id]", params: { id: String(post.id) } });

export const sharePost = (post: Post) => Share.share({ message: `${post.title}\n${post.url}`, url: post.url });

// MARK: Glass buttons (ButtonWithGlassEffect.swift: 44pt circle, 16pt symbol)

export function GlassCircle({
  icon,
  label,
  onPress,
  iconSize = 22,
  style,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [
        styles.circle,
        { backgroundColor: c.glassSolid, borderColor: c.hairline, opacity: pressed ? 0.6 : 1 },
        style,
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={c.text} />
    </Pressable>
  );
}

// MARK: Header (ToolbarModifier.swift .normal: inline "Notícias", options left, menu right)

export function Screen({
  title,
  left,
  right,
  children,
}: {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {children}
      {/* Content scrolls under a header that fades into the page, like iOS 26's scroll edge effect. */}
      <View
        pointerEvents="box-none"
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            experimental_backgroundImage: `linear-gradient(to bottom, ${c.bg} 0%, ${c.bg} 60%, ${c.bg}00 100%)`,
          },
        ]}
      >
        <View style={styles.headerSide}>{left}</View>
        <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        <View style={[styles.headerSide, { alignItems: "flex-end" }]}>{right}</View>
      </View>
    </View>
  );
}

export const BackButton = () => (
  <GlassCircle icon="chevron-back" label="Voltar" onPress={() => router.back()} />
);

// MARK: Metadata row (MetadataContent.swift: Label(calendar / person.fill), caption2, spacing 8)

function Meta({ post, color, wrapAuthor }: { post: Post; color: string; wrapAuthor?: boolean }) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <Ionicons name="calendar-outline" size={12} color={color} />
        <Text style={[styles.meta, { color }]} numberOfLines={1}>
          {timeAgo(post.publishedAt)}
        </Text>
      </View>
      {post.author ? (
        <View style={[styles.metaItem, { flexShrink: 1 }]}>
          <Ionicons name="person" size={12} color={color} />
          <Text style={[styles.meta, { color, flexShrink: 1 }]} numberOfLines={wrapAuthor ? 2 : 1}>
            {post.author}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// MARK: "…" menu (MenuButton.swift: Favorito / Compartilhar)

function MenuButton({ post, onImage }: { post: Post; onImage?: boolean }) {
  const c = useColors();
  const favorite = useIsFavorite(post.id);
  const ref = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ top: number; right: number }>();
  const { width } = useWindowDimensions();

  const open = () =>
    ref.current?.measureInWindow((x, y, w, h) => setAnchor({ top: y + h + 6, right: width - x - w }));
  const run = (action: () => void) => {
    setAnchor(undefined);
    action();
  };

  return (
    <>
      <Pressable
        ref={ref}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu de opções."
        style={({ pressed }) => [
          styles.circle,
          onImage
            ? { backgroundColor: c.heroButton, borderWidth: 0 }
            : { backgroundColor: c.glassSolid, borderColor: c.hairline },
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Ionicons name="ellipsis-horizontal" size={18} color={c.text} />
      </Pressable>
      <Modal transparent visible={anchor !== undefined} animationType="fade" onRequestClose={() => setAnchor(undefined)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setAnchor(undefined)} accessibilityLabel="Fechar menu" />
        <View style={[styles.menu, { backgroundColor: c.glassSolid, ...anchor }]}>
          <MenuRow
            icon={favorite ? "star" : "star-outline"}
            label={favorite ? "Remover dos favoritos" : "Favoritar"}
            onPress={() => run(() => toggleFavorite(post))}
          />
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.hairline }} />
          <MenuRow icon="share-outline" label="Compartilhar" onPress={() => run(() => sharePost(post))} />
        </View>
      </Modal>
    </>
  );
}

function MenuRow({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="menuitem" style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: c.field }]}>
      <Text style={[styles.menuLabel, { color: c.text }]}>{label}</Text>
      <Ionicons name={icon} size={20} color={c.text} />
    </Pressable>
  );
}

// MARK: Highlight card (GlassCardView.swift: radius 18, gradient 0/.6/.95, title2 bold, 3 lines)

function HeroCard({ post }: { post: Post }) {
  return (
    <Pressable onPress={() => openPost(post)} accessibilityRole="link" style={styles.hero}>
      {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
      <View style={styles.heroText}>
        <Text style={styles.heroTitle} numberOfLines={3}>
          {post.title}
        </Text>
        <Meta post={post} color="rgba(255,255,255,0.9)" />
      </View>
      <View style={styles.heroMenu}>
        <MenuButton post={post} onImage />
      </View>
    </Pressable>
  );
}

// MARK: Carousel (FeedHighlightsCarouselView.swift: spacing 12, scale .95 / opacity .85;
// phone: height 280 (180 in landscape), peek 40 · regular size class (iPad, unfolded Fold): height 320, peek 60)

const GAP = 12;

export function HeroCarousel({ posts }: { posts: Post[] }) {
  const { width, height: screenHeight } = useWindowDimensions();
  const regular = width >= 600 && screenHeight >= 600;
  const peek = regular ? 60 : 40;
  const height = regular ? 320 : screenHeight < 500 ? 180 : 280;
  const cardWidth = width - peek * 2;
  const step = cardWidth + GAP;
  const x = useRef(new Animated.Value(0)).current;

  return (
    <Animated.FlatList
      horizontal
      data={posts}
      keyExtractor={(p) => String(p.id)}
      showsHorizontalScrollIndicator={false}
      snapToInterval={step}
      decelerationRate="fast"
      disableIntervalMomentum
      contentContainerStyle={{ paddingHorizontal: peek, gap: GAP }}
      style={{ height, flexGrow: 0 }}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { x } } }], { useNativeDriver: true })}
      scrollEventThrottle={16}
      renderItem={({ item, index }) => {
        const inputRange = [(index - 1) * step, index * step, (index + 1) * step];
        const scale = x.interpolate({ inputRange, outputRange: [0.95, 1, 0.95], extrapolate: "clamp" });
        const opacity = x.interpolate({ inputRange, outputRange: [0.85, 1, 0.85], extrapolate: "clamp" });
        return (
          <Animated.View style={{ width: cardWidth, height, opacity, transform: [{ scale }] }}>
            <HeroCard post={item} />
          </Animated.View>
        );
      }}
    />
  );
}

// MARK: List card (LeadingImageCard.swift: padding 10, image 100 radius 8, outer radius 18, headline 3 lines)

export function NewsCard({ post }: { post: Post }) {
  const c = useColors();
  return (
    <Pressable
      onPress={() => openPost(post)}
      accessibilityRole="link"
      style={({ pressed }) => [styles.card, { backgroundColor: c.card, opacity: pressed ? 0.7 : 1 }]}
    >
      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={[styles.thumb, { backgroundColor: c.field }]} resizeMode="cover" />
      ) : null}
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={3}>
            {post.title}
          </Text>
          <MenuButton post={post} />
        </View>
        <Meta post={post} color={c.meta} wrapAuthor />
      </View>
    </Pressable>
  );
}

// MARK: Feed list (CollectionViewWithHeader.swift: spacing 20, horizontal padding 16)

export function PostList({
  posts,
  error,
  empty,
  header,
  topInset,
}: {
  posts?: Post[];
  error?: Error;
  empty: string;
  header?: ReactNode;
  topInset?: number;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <FlatList
      data={posts ?? []}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => <NewsCard post={item} />}
      contentContainerStyle={{
        paddingTop: topInset ?? insets.top + 8 + HEADER_HEIGHT + 28,
        paddingBottom: TAB_BAR_SPACE + insets.bottom,
        paddingHorizontal: 16,
        gap: 20,
      }}
      ListHeaderComponent={header ? <View style={{ marginHorizontal: -16, marginBottom: 8 }}>{header}</View> : null}
      ListEmptyComponent={
        error ? (
          <Text style={[styles.empty, { color: c.muted }]}>Não foi possível carregar as notícias. {error.message}</Text>
        ) : posts === undefined ? (
          <ActivityIndicator style={{ marginTop: 48 }} />
        ) : (
          <Text style={[styles.empty, { color: c.muted }]}>{empty}</Text>
        )
      }
    />
  );
}

// MARK: Grouped list rows (iOS insetGrouped), used by Categorias and Ajustes

export function Group({ children }: { children: ReactNode }) {
  const c = useColors();
  return <View style={[styles.group, { backgroundColor: c.card }]}>{children}</View>;
}

export function Row({
  icon,
  label,
  detail,
  onPress,
  last,
}: {
  icon?: IconName;
  label: string;
  detail?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : "text"}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: c.field }]}
    >
      {icon ? <Ionicons name={icon} size={22} color={c.text} /> : null}
      <View style={[styles.rowInner, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.hairline }]}>
        <Text style={[styles.rowLabel, { color: c.text }]} numberOfLines={1}>
          {label}
        </Text>
        {detail ? <Text style={[styles.rowDetail, { color: c.muted }]}>{detail}</Text> : null}
        {onPress ? <Ionicons name="chevron-forward" size={16} color={c.muted} /> : null}
      </View>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerSide: { width: 96, flexDirection: "row", gap: 8 },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: font.semibold, fontSize: 17, letterSpacing: -0.43, lineHeight: HEADER_HEIGHT },
  metaRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { fontFamily: font.regular, fontSize: 11, lineHeight: 13, letterSpacing: 0.06 },
  hero: { flex: 1, borderRadius: 18, overflow: "hidden", backgroundColor: "#1C1C1E", justifyContent: "flex-end" },
  heroText: {
    paddingHorizontal: 12,
    paddingTop: 10 + 30,
    paddingBottom: 10,
    gap: 6,
    experimental_backgroundImage:
      "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.95) 100%)",
  },
  heroTitle: { color: "#FFFFFF", fontFamily: font.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.26 },
  heroMenu: { position: "absolute", top: 10, right: 10 },
  card: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 10, borderRadius: 18 },
  thumb: { width: 100, height: 100, borderRadius: 8 },
  cardBody: { flex: 1, gap: 6 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 4 },
  cardTitle: { flex: 1, minHeight: 66, fontFamily: font.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.43 },
  menu: {
    position: "absolute",
    minWidth: 240,
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  menuRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, paddingHorizontal: 16, paddingVertical: 12 },
  menuLabel: { fontFamily: font.regular, fontSize: 17, letterSpacing: -0.43 },
  empty: { textAlign: "center", marginTop: 48, fontFamily: font.regular, fontSize: 15, lineHeight: 20 },
  group: { marginHorizontal: 16, borderRadius: 26, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingLeft: 16 },
  rowInner: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minHeight: 52, paddingRight: 16 },
  rowLabel: { fontFamily: font.regular, fontSize: 17, letterSpacing: -0.43, flexShrink: 1, marginRight: "auto" },
  rowDetail: { fontFamily: font.regular, fontSize: 17, letterSpacing: -0.43 },
});
