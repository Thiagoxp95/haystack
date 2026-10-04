import { api } from "@haystack/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Feed } from "../components";

export const Route = createFileRoute("/category/$id")({ component: CategoryPage });

function CategoryPage() {
  const { id } = Route.useParams();
  const categoryId = Number(id) || -1;
  const category = useQuery(api.articles.categories, {})?.find((c) => c.id === categoryId);
  return <Feed categoryId={categoryId} title={category?.name ?? "Categoria"} />;
}
