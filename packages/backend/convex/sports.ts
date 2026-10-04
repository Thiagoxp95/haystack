// Single source of truth for sports. Both apps import this file.
// To add a sport: add an entry here. Nothing else is required.
export const SPORTS = [
  { slug: "soccer", label: "Futebol", feed: "https://www.espn.com/espn/rss/soccer/news" },
  { slug: "nba", label: "NBA", feed: "https://www.espn.com/espn/rss/nba/news" },
  { slug: "nfl", label: "NFL", feed: "https://www.espn.com/espn/rss/nfl/news" },
  { slug: "f1", label: "F1", feed: "https://www.espn.com/espn/rss/f1/news" },
  { slug: "tennis", label: "Tênis", feed: "https://www.espn.com/espn/rss/tennis/news" },
  { slug: "nhl", label: "NHL", feed: "https://www.espn.com/espn/rss/nhl/news" },
] as const;

export type Sport = (typeof SPORTS)[number]["slug"];

export const sportLabel = (slug: string) =>
  SPORTS.find((s) => s.slug === slug)?.label ?? slug;
