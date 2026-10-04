import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "../components";

export const Route = createFileRoute("/")({ component: () => <Feed /> });
