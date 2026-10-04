import { api } from "@haystack/backend/convex/_generated/api";
import { sportLabel } from "@haystack/backend/convex/sports";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { BySport, Card, Meta } from "../components";

export const Route = createFileRoute("/article/$id")({ component: ArticlePage });

function ArticlePage() {
  const { id } = Route.useParams();
  const article = useQuery(api.articles.get, { id });
  const related = useQuery(api.articles.list, article ? { sport: article.sport, limit: 4 } : "skip");

  if (article === undefined) return <main className="container skeleton-block" />;
  if (article === null)
    return (
      <main className="container empty">
        <h1>Notícia não encontrada</h1>
        <Link to="/">Voltar para a capa</Link>
      </main>
    );

  const more = (related ?? []).filter((a) => a._id !== article._id).slice(0, 3);

  return (
    <main className="container">
      <div className="with-sidebar article-layout">
        <article className="article">
          <Link to="/sport/$sport" params={{ sport: article.sport }} className="tag">
            {sportLabel(article.sport)}
          </Link>
          <h1>{article.title}</h1>
          <p className="lede">{article.summary}</p>
          <Meta article={article} />
          <img className="article-image" src={article.imageUrl} alt="" />
          <div className="body">
            {article.body.split("\n\n").filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <a className="source-link" href={article.url} target="_blank" rel="noreferrer">
            Leia a matéria completa em {article.source} →
          </a>
        </article>
        <BySport />
      </div>

      {more.length > 0 && (
        <section className="related">
          <h2 className="section-title">Mais de {sportLabel(article.sport)}</h2>
          <div className="grid grid-3">
            {more.map((a) => (
              <Card key={a._id} article={a} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
