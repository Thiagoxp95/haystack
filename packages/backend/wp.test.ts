// `pnpm --filter @haystack/backend test` — Node runs this TypeScript directly.
import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeEntities, toPost } from "./convex/wp.ts";

test("decodes WordPress entities", () => {
  assert.equal(decodeEntities("Ouro &#8211; &#8220;sim&#8221; &amp; &hellip; &#x2014;"), "Ouro – “sim” & … —");
  assert.equal(decodeEntities("&bogus; &#0; &#99999999;"), "&bogus; &#0; &#99999999;");
});

test("normalizes an embedded post", () => {
  const p = toPost({
    id: 7,
    date_gmt: "2026-10-01T20:35:16",
    link: "https://esporteparatodos.com/x/",
    title: { rendered: "A &#8211; B" },
    excerpt: { rendered: "<p>Resumo [&hellip;]</p>\n" },
    content: { rendered: "<p>Corpo</p>" },
    categories: [3],
    _embedded: {
      author: [{ name: "Ana" }],
      "wp:featuredmedia": [{ source_url: "full.jpg", media_details: { sizes: { medium_large: { source_url: "ml.jpg" } } } }],
      "wp:term": [[{ id: 3, name: "Treinos &amp; Dicas", taxonomy: "category" }], [{ id: 9, name: "tag", taxonomy: "post_tag" }]],
    },
  });
  assert.deepEqual(
    { ...p, publishedAt: undefined },
    {
      id: 7, title: "A – B", excerpt: "Resumo…", body: "<p>Corpo</p>", imageUrl: "ml.jpg", author: "Ana",
      category: "Treinos & Dicas", categoryIds: [3], url: "https://esporteparatodos.com/x/", publishedAt: undefined,
    },
  );
  assert.equal(p.publishedAt, Date.UTC(2026, 9, 1, 20, 35, 16));
});
