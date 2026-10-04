import { api } from "@haystack/backend/convex/_generated/api";
import type { Doc } from "@haystack/backend/convex/_generated/dataModel";
import { SPORTS, sportLabel } from "@haystack/backend/convex/sports";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";

export const SITE_NAME = "Esporte para Todos";

type Article = Doc<"articles">;

export function SiteHeader() {
  return (
    <header className="container site-header">
      <nav className="nav" aria-label="Principal">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden="true">
            EpT
          </span>
          {SITE_NAME}
        </Link>
        <div className="nav-links">
          {SPORTS.map((s) => (
            <Link key={s.slug} to="/sport/$sport" params={{ sport: s.slug }} activeProps={{ className: "active" }}>
              {s.label}
            </Link>
          ))}
        </div>
        <button type="button" className="theme-toggle" aria-label="Alternar tema claro/escuro" onClick={toggleTheme}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </nav>
    </header>
  );
}

// Runs before paint (inlined in <head>) so a saved theme doesn't flash.
export const THEME_INIT = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

function toggleTheme() {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try {
    localStorage.setItem("theme", root.dataset.theme);
  } catch {}
}

export function Feed({ sport }: { sport?: string }) {
  const articles = useQuery(api.articles.list, { sport });
  const highlights = articles?.slice(0, 5) ?? [];
  const latest = articles?.slice(5) ?? [];

  return (
    <main className="container">
      {sport ? <h1 className="page-title">{sportLabel(sport)}</h1> : <h1 className="sr-only">{SITE_NAME}</h1>}

      {articles === undefined ? (
        <div className="skeleton-block" />
      ) : articles.length === 0 ? (
        <p className="empty">
          Nenhuma notícia ainda. Rode <code>pnpm --filter @haystack/backend seed</code>.
        </p>
      ) : (
        <>
          <section className="highlights" aria-label="Destaques">
            {highlights.map((a) => (
              <Highlight key={a._id} article={a} />
            ))}
          </section>
          <div className="with-sidebar">
            <section>
              {latest.length > 0 && <h2 className="section-title">Últimas notícias</h2>}
              <div className="grid">
                {latest.map((a) => (
                  <Card key={a._id} article={a} />
                ))}
              </div>
            </section>
            <BySport />
          </div>
        </>
      )}
    </main>
  );
}

function Highlight({ article }: { article: Article }) {
  return (
    <Link to="/article/$id" params={{ id: article._id }} className="highlight">
      <img src={article.imageUrl} alt="" />
      <div className="highlight-text">
        <span className="tag">{sportLabel(article.sport)}</span>
        <h2>{article.title}</h2>
        <Meta article={article} />
      </div>
    </Link>
  );
}

export function Card({ article }: { article: Article }) {
  return (
    <Link to="/article/$id" params={{ id: article._id }} className="card">
      <span className="tag">{sportLabel(article.sport)}</span>
      <h3>{article.title}</h3>
      <Meta article={article} />
      <img src={article.imageUrl} alt="" loading="lazy" />
    </Link>
  );
}

export function Meta({ article }: { article: Article }) {
  return (
    <p className="meta">
      <strong>{article.source}</strong>
      <time dateTime={new Date(article.publishedAt).toISOString()}>{timeAgo(article.publishedAt)}</time>
    </p>
  );
}

/** Sidebar: the newest headline in each sport, numbered. */
export function BySport() {
  const articles = useQuery(api.articles.list, {});
  const rows = SPORTS.flatMap((s) => articles?.find((a) => a.sport === s.slug) ?? []);
  if (rows.length === 0) return null;

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Por esporte</h2>
      <ol className="ranked">
        {rows.map((a, i) => (
          <li key={a._id}>
            <span className="rank">{i + 1}</span>
            <Link to="/article/$id" params={{ id: a._id }}>
              <span className="tag">{sportLabel(a.sport)}</span>
              {a.title}
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export function timeAgo(ms: number) {
  const min = Math.round((Date.now() - ms) / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} ${h === 1 ? "hora" : "horas"}`;
  const d = Math.round(h / 24);
  if (d < 7) return `há ${d} ${d === 1 ? "dia" : "dias"}`;
  return new Date(ms).toLocaleDateString("pt-BR");
}
