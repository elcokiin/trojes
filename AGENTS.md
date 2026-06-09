# AGENTS.md

## Task Completion Requirements

- Run the narrowest useful verification before handing back code changes.
- For most code changes, prefer `bun run lint`.
- For changes that affect routing, rendering, server components, API routes, auth, database access, or release readiness, also run `bun run build`.
- There is currently no test script, Vitest setup, format script, or typecheck script in `package.json`. Do not claim those gates ran unless they are added to the project.
- Do not run `bun test`; this project does not currently define a Bun test workflow.

## Attribution

Do not add any AI assistant, Claude, Anthropic, or `Co-Authored-By`
attribution/trailers to commits, commit messages, PRs, or generated files.

Pull request titles and descriptions may go to a public GitHub repo, so avoid
using specific names or internal info unless explicitly stated to.

## Collaboration Notes

The user uses speech to text occasionally, so if sentences are weird or words
are not right, infer the likely intent and ask only when needed.

Do not give time estimates unless explicitly asked. Focus on the next concrete
step and the verification needed for the change.

## Project Context and Decisions

- This project is an idea capture and management app named Troje. Preserve the
  Troje naming on user-facing docs/UI unless a future task explicitly renames or
  rebrands the product.
- For product direction, domain vocabulary, and long-term design guidance, read
  and align with `notes/research/troje-product-model.md`.
- For currently documented behavior, setup, API examples, keyboard shortcuts,
  database shape, and feature list, read `README.md`.
- There is no `DOMAIN_DOC.html` in this repo. Do not reference it as required
  project context unless it is added later.

## Stack and Tooling

- This is a Next.js 16 App Router application using React 19, TypeScript,
  Tailwind CSS v4, shadcn/ui, NextAuth, Neon serverless PostgreSQL, SWR, and
  Vercel-oriented PWA assets.
- Run package scripts and project commands with Bun, for example
  `bun run <script>`, `bun install`, or `bunx <tool>`.
- Do not use npm, pnpm, or yarn unless a documented exception is added.
- Current package scripts are:
  - `bun run dev`
  - `bun run build`
  - `bun run start`
  - `bun run lint`

## Reference Material

- Use `notes/references.md` as the project registry for external references,
  inspiration repos, documents, articles, or URLs that are relevant to future
  implementation decisions.
- If the user explicitly provides a reference repository or URL for a task,
  document it in `notes/references.md` with enough context to explain why it is
  useful.
- If the user provides an image to store as a reference, copy it into an
  appropriate subfolder under `notes/references/` using a descriptive,
  kebab-case filename.
- For every reference image added under `notes/references/`, add a sibling
  Markdown file with the same basename as the image. The Markdown file must name
  the image file and briefly explain what the image shows, its important visual
  or product elements, and how future agents should interpret it if they cannot
  view the image directly. Also update `notes/references.md` with a short
  description of any new reference folder.
- Do not commit cloned reference repositories. Store their source URL and
  inspection notes under `notes/references/`; clone them only into disposable
  locations unless the user explicitly asks otherwise.
- This repo does not currently include checked-in reference repositories. Do not
  assume `.reference/` exists unless it is added later.
- If a reference repository must be cloned for inspection, ask where it should be
  placed if the location matters. Otherwise, inspect it in a disposable location
  and avoid adding it to the project unless the user wants it committed.
- Prefer local project files first: `README.md`, `notes/research/`, existing
  components, hooks, API routes, and shadcn configuration.

## Engineering Priorities

- Prefer correctness and predictable behavior over short-term convenience.
- Preserve runtime behavior when changing lint, typing, build, auth, database, or
  API structure.
- Keep Next.js App Router boundaries clear: use server components by default,
  add `"use client"` only when hooks, browser APIs, or client interactivity are
  required.
- Use the configured path aliases from `components.json` and `tsconfig.json`
  (`@/components`, `@/lib`, `@/hooks`) instead of brittle relative imports.
- Keep shared logic local until repeated behavior is real and existing patterns
  support extraction.
- For database changes, consider Neon/PostgreSQL behavior and avoid breaking the
  existing API response shapes documented in `README.md`.

## UI and Shortcuts

- The UI uses shadcn/ui components and lucide icons. Prefer existing components
  in `components/ui` before adding new primitives.
- Preserve keyboard-first workflows. When adding or changing a keyboard shortcut,
  update all relevant places:
  - `README.md` shortcut table
  - `components/settings-dialog.tsx` visible shortcut help
  - `hooks/use-keyboard-navigation.ts` or the component-level key handler that
    owns the behavior
- Use `Kbd` from `components/ui/kbd.tsx` for visible shortcut labels.
- Keep capture workflows low-friction, especially mobile/PWA paths and the quick
  capture form.

## Environment Notes

- Required environment variables are documented in `.env.example` and `README.md`.
  `DATABASE_URL` is required for database-backed features.
- Use `MISTAKES.md` to record mistakes made while working on the project, with
  enough context to avoid repeating them.
- Use `DESIRES.md` to record missing context, tools, scripts, docs, or
  capabilities that would have made the work easier or safer.
- Use `LEARNINGS.md` to record durable lessons about the project, environment,
  tooling, or workflow that future agents should know.
