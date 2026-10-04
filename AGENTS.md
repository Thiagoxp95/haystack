# AGENTS.md

Everything an agent needs is in [README.md](./README.md): layout, setup, conventions, how-tos, and the do/don't rules. Read it before changing code.

Short version:
- Backend = Convex in `packages/backend/convex`. Web = TanStack Start in `apps/web`. Mobile = Expo in `apps/mobile`.
- Sports live in one list: `packages/backend/convex/sports.ts`.
- Never hand-edit `convex/_generated/*` or `apps/web/src/routeTree.gen.ts`.
- Before you finish: `pnpm typecheck && pnpm lint` (plus `pnpm build` for web changes).
- Expo-specific guidance: `apps/mobile/AGENTS.md`.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
