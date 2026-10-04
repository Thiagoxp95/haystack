import { SPORTS } from "@haystack/backend/convex/sports";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Feed } from "../components";

export const Route = createFileRoute("/sport/$sport")({
  beforeLoad: ({ params }) => {
    if (!SPORTS.some((s) => s.slug === params.sport)) throw notFound();
  },
  component: SportPage,
});

function SportPage() {
  const { sport } = Route.useParams();
  return <Feed sport={sport} />;
}
