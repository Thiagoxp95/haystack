import { api } from "@haystack/backend/convex/_generated/api";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ByCategory, Card, Meta } from "../components";

export const Route = createFileRoute("/article/$id")({ component: ArticlePage });

function ArticlePage() {
  const { id } = Route.useParams();
  const article = useQuery(api.articles.get, { id: Number(id) || -1 });
  const categoryId = article?.categoryIds[0];
  const related = useQuery(api.articles.list, categoryId !== undefined ? { categoryId, limit: 4 } : "skip");

  if (article === undefined) return <main className="container skeleton-block" />;
  if (article === null)
    return (
      <main className="container empty">
        <h1>Notícia não encontrada</h1>
        <Link to="/">Voltar para a capa</Link>
      </main>
    );

  const more = (related ?? []).filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <main className="container">
      <div className="with-sidebar article-layout">
        <article className="article">
          {categoryId !== undefined && (
            <Link to="/category/$id" params={{ id: String(categoryId) }} className="tag">
              {article.category}
            </Link>
          )}
          <h1>{article.title}</h1>
          <p className="lede">{article.excerpt}</p>
          <Meta article={article} />
          {article.imageUrl && <img className="article-image" src={article.imageUrl} alt="" />}
          {/* Rendered HTML from our own WordPress. */}
          <div className="body" dangerouslySetInnerHTML={{ __html: article.body }} />
          <a className="source-link" href={article.url} target="_blank" rel="noreferrer">
            Ver no site →
          </a>
        </article>
        <ByCategory />
      </div>

      {more.length > 0 && (
        <section className="related">
          <h2 className="section-title">Mais de {article.category}</h2>
          <div className="grid grid-3">
            {more.map((a) => (
              <Card key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
