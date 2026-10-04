import { api } from "@haystack/backend/convex/_generated/api";
import { sportLabel } from "@haystack/backend/convex/sports";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { timeAgo } from "../components";

export const Route = createFileRoute("/article/$id")({ component: ArticlePage });

function ArticlePage() {
  const { id } = Route.useParams();
  const article = useQuery(api.articles.get, { id });

  if (article === undefined) return <main className="container article skeleton-block" />;
  if (article === null)
    return (
      <main className="container empty">
        <h1>Story not found</h1>
        <Link to="/">Back to the feed</Link>
      </main>
    );

  return (
    <main className="container article">
      <Link to="/sport/$sport" params={{ sport: article.sport }} className="eyebrow">
        {sportLabel(article.sport)}
      </Link>
      <h1>{article.title}</h1>
      <p className="lede">{article.summary}</p>
      <p className="meta">
        {article.source} · {timeAgo(article.publishedAt)}
      </p>
      <img className="article-image" src={article.imageUrl} alt="" />
      <div className="body">
        {article.body.split("\n\n").filter(Boolean).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <a className="source-link" href={article.url} target="_blank" rel="noreferrer">
        Read the full story at {article.source} →
      </a>
    </main>
  );
}
