import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("refresh WordPress posts", { minutes: 30 }, internal.news.refresh, {});

export default crons;
