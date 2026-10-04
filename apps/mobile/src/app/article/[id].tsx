import { WP_BASE_URL } from "@haystack/backend/convex/wp";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Linking, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { usePost, type Post } from "../../data";
import { toggleFavorite, useIsFavorite } from "../../favorites";
import { useColors, type Colors } from "../../theme";
import { BackButton, GlassCircle, sharePost, styles, timeAgo } from "../../ui";

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: post, error } = usePost(Number(id) || -1);
  const favorite = useIsFavorite(Number(id));
  const insets = useSafeAreaInsets();
  const c = useColors();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {post ? (
        <WebView
          source={{ html: articleHtml(post, c, insets.bottom), baseUrl: WP_BASE_URL }}
          style={{ backgroundColor: c.bg }}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          // Taps on links leave the app; the article itself and embeds (YouTube iframes) load in place.
          onShouldStartLoadWithRequest={(req) => {
            if (req.isTopFrame === false || req.url.replace(/\/$/, "") === WP_BASE_URL || req.url === "about:blank") return true;
            Linking.openURL(req.url).catch(() => {});
            return false;
          }}
        />
      ) : error || post === null ? (
        <Text style={[styles.empty, { color: c.muted, marginTop: insets.top + 96 }]}>Notícia não encontrada.</Text>
      ) : (
        <ActivityIndicator style={{ flex: 1 }} />
      )}
      <View style={{ position: "absolute", top: insets.top + 8, left: 16, right: 16, flexDirection: "row", gap: 8 }}>
        <BackButton />
        <View style={{ flex: 1 }} />
        {post ? (
          <>
            <GlassCircle icon={favorite ? "star" : "star-outline"} label="Favoritar" onPress={() => toggleFavorite(post)} />
            <GlassCircle icon="share-outline" label="Compartilhar" onPress={() => sharePost(post)} />
          </>
        ) : null}
      </View>
    </View>
  );
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** WP leaves an un-embedded YouTube URL bare inside its embed block; turn those into players too. */
const embedYouTube = (html: string) =>
  html.replace(
    /<div class="wp-block-embed__wrapper">\s*(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})[^<]*<\/div>/g,
    '<div class="wp-block-embed__wrapper"><iframe src="https://www.youtube.com/embed/$1" allowfullscreen></iframe></div>',
  );

function articleHtml(p: Post, c: Colors, bottomInset: number) {
  return `<!doctype html><html lang="pt-BR"><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">
<style>
  body { margin: 0; background: ${c.bg}; color: ${c.text}; font: 17px/1.55 Inter, system-ui, sans-serif; -webkit-text-size-adjust: none; }
  .hero { display: block; width: 100%; aspect-ratio: 3 / 2; object-fit: cover; background: ${c.field}; }
  main { padding: 20px 16px ${bottomInset + 40}px; }
  h1 { font-size: 28px; line-height: 34px; font-weight: 700; letter-spacing: 0.36px; margin: 0 0 12px; }
  .meta { color: ${c.meta}; font-size: 13px; margin: 0 0 20px; }
  img, video, figure { max-width: 100%; height: auto; }
  figure { margin: 20px 0; } figcaption { color: ${c.muted}; font-size: 13px; }
  iframe { width: 100%; aspect-ratio: 16 / 9; height: auto; border: 0; border-radius: 12px; }
  a { color: ${c.text}; }
  blockquote { margin: 20px 0; padding-left: 14px; border-left: 3px solid ${c.hairline}; }
</style></head><body>
${p.imageUrl ? `<img class="hero" src="${esc(p.imageUrl)}" alt="">` : `<div style="height:110px"></div>`}
<main>
  <h1>${esc(p.title)}</h1>
  <p class="meta">${esc([timeAgo(p.publishedAt), p.author].filter(Boolean).join(" · "))}</p>
  ${embedYouTube(p.body)}
</main></body></html>`;
}
