/// <reference types="vite/client" />
import { HeadContent, Link, Scripts, createRootRoute } from "@tanstack/react-router";
import { ConvexProvider } from "convex/react";
import type { ReactNode } from "react";
import { SITE_NAME, SiteHeader, THEME_INIT } from "../components";
import { convex } from "../convex";
import css from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${SITE_NAME} — Notícias de esporte` },
      { name: "description", content: "Corrida, treinos, saúde, eventos e o mercado do esporte." },
      { name: "color-scheme", content: "light dark" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Exo+2:wght@500;600;700&family=Rubik:wght@400;500&display=swap" },
      { rel: "stylesheet", href: css },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <main className="container empty">
      <h1>Página não encontrada</h1>
      <Link to="/">Voltar para a capa</Link>
    </main>
  ),
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <ConvexProvider client={convex}>
          <SiteHeader />
          {children}
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  );
}
