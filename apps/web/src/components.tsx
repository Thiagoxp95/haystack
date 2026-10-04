import { api } from "@haystack/backend/convex/_generated/api";
import type { Doc } from "@haystack/backend/convex/_generated/dataModel";
import { SPORTS, sportLabel } from "@haystack/backend/convex/sports";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";

export function Feed({ sport }: { sport?: string }) {
  const articles = useQuery(api.articles.list, { sport });
  const [top, ...rest] = articles ?? [];

  return (
    <main className="container">
      <header className="page-header">
        <h1>{sport ? sportLabel(sport) : "Top Stories"}</h1>
        <SportPills active={sport} />
      </header>

      {articles === undefined ? (
        <div className="hero skeleton-block" />
      ) : !top ? (
        <p className="empty">
          No stories yet. Run <code>pnpm --filter @haystack/backend seed</code>.
        </p>
      ) : (
        <>
          <Hero article={top} />
          <section className="grid">
            {rest.map((a) => (
              <Card key={a._id} article={a} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}

function SportPills({ active }: { active?: string }) {
  return (
    <div className="pills" role="navigation" aria-label="Sports">
      <Link to="/" className={active ? "pill" : "pill active"}>
        All
      </Link>
      {SPORTS.map((s) => (
        <Link key={s.slug} to="/sport/$sport" params={{ sport: s.slug }} className={s.slug === active ? "pill active" : "pill"}>
          {s.label}
        </Link>
      ))}
    </div>
  );
}

function Hero({ article }: { article: Doc<"articles"> }) {
  return (
    <Link to="/article/$id" params={{ id: article._id }} className="hero">
      <img src={article.imageUrl} alt="" />
      <div className="hero-text">
        <span className="eyebrow">{sportLabel(article.sport)}</span>
        <h2>{article.title}</h2>
        <p>{article.summary}</p>
      </div>
    </Link>
  );
}

function Card({ article }: { article: Doc<"articles"> }) {
  return (
    <Link to="/article/$id" params={{ id: article._id }} className="card">
      <img src={article.imageUrl} alt="" loading="lazy" />
      <div className="card-text">
        <span className="eyebrow">{sportLabel(article.sport)}</span>
        <h3>{article.title}</h3>
        <p className="meta">
          {article.source} · {timeAgo(article.publishedAt)}
        </p>
      </div>
    </Link>
  );
}

export function timeAgo(ms: number) {
  const min = Math.round((Date.now() - ms) / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  if (min < 24 * 60) return `${Math.round(min / 60)}h ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
