/// <reference types="vite/client" />
import { HeadContent, Link, Scripts, createRootRoute } from "@tanstack/react-router";
import { ConvexProvider } from "convex/react";
import type { ReactNode } from "react";
import { convex } from "../convex";
import css from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Haystack — Sports news" },
      { name: "description", content: "The latest across soccer, NBA, NFL, F1, tennis and NHL." },
      { name: "color-scheme", content: "light dark" },
    ],
    links: [{ rel: "stylesheet", href: css }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <main className="container empty">
      <h1>Not found</h1>
      <Link to="/">Back to Haystack</Link>
    </main>
  ),
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <nav className="nav">
          <div className="container nav-inner">
            <Link to="/" className="logo">
              Haystack
            </Link>
          </div>
        </nav>
        <ConvexProvider client={convex}>{children}</ConvexProvider>
        <Scripts />
      </body>
    </html>
  );
}
