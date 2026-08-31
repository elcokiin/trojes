<p align="center">
  <img src="public/screenshots/logo-font.png" width="300" alt="Trojes logo" />
</p>

<p align="center">
  <em>Idea: "aprovechar el lote, comprar semillas pa' sembrar papa" → saved to Trojes 🤗</em>
</p>

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00e599?logo=neon)](https://neon.tech)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Trojes is an **idea capture and analysis** app built for the moments inspiration strikes. Capture is optimized for speed of entry — no structure, no tags, no overhead — and every captured idea is queued to be **grilled**: an interactive interview that walks you through a tree of questions, researches the state of the art, and closes with a verdict. Capture is just the beginning; clarity is the product.

---

## Screenshots

| |
|---|
| ![Main dashboard](public/screenshots/dashboard.png) |
| **Main dashboard** – ideas in a masonry grid, Inbox/Archived/Trash tabs, and bottom navigation. This is where you spend your time. |
| <img src="public/screenshots/mobile.png" width="280" alt="Mobile" style="display: block; margin: 0 auto;" /> |
| **Mobile PWA** – installable on your home screen, icon-only tab navigation, bottom sheet for pinned ideas. |

---

## Features

- **Frictionless capture** — Press `i`, type, save with `⌘↵`. Done.
- **Keyboard-first** — Navigate ideas with `j`/`k`, act with `Enter`, no mouse needed.
- **Masonry grid** — Pinterest-style layout.
- **Markdown support** — Write with **bold**, *italics*, lists, code blocks, headings, and more. Rendered inline on cards.
- **Pin & organize** — Pin important ideas to a persistent tray, archive the rest.
- **Trash with recovery** — Soft delete with time tracking, permanent delete option.
- **API-first capture** — Generate API keys from Settings, POST ideas from any tool.
- **PWA ready** — Install on mobile home screen, works offline.
- **Offline-first sync** — Ideas are saved to a device-local SQLite mirror (PowerSync) and synced to the server when connectivity returns.
- **Dark mode** — Light, dark, and system themes with a single keystroke (`d`).

> **Coming next: the grilling pipeline.** A visible queue that preps each captured idea (transcription, distillation, web research, question-tree generation), an interactive 8-branch grilling interview, and a verdict — AI recommends, you vote (pin / keep / archive). See [Roadmap](#roadmap).

---

## Quick Start

```bash
bun install
bun run db:migrate
bun dev
```

Open [http://localhost:3000](http://localhost:3000) — sign in with Google.

### Database

Trojes uses Drizzle ORM with Neon PostgreSQL:

```bash
bun run db:generate   # Create migration
bun run db:migrate    # Apply migration
bun run db:studio     # Open Drizzle Studio
```

Environment variables: see `.env.example` — only `DATABASE_URL` is required.

### Offline sync (PowerSync)

Trojes is offline-first: the client reads and writes to a local SQLite mirror
backed by [PowerSync](https://www.powersync.com), which syncs bidirectionally
with Neon PostgreSQL. Capture always works — even offline — and local changes
are uploaded when connectivity returns.

- `DATABASE_URL` remains required for the server database.
- `POWERSYNC_INSTANCE_URL`, `POWERSYNC_JWT_SECRET`, `POWERSYNC_JWT_KID`, and
  `POWERSYNC_JWT_AUDIENCE` are required for sync. Your PowerSync instance must
  be connected to the same Postgres database (logical replication), and the
  `ideas` table must be in a publication tracked by PowerSync.
- The client serves its worker from `public/@powersync/` (regenerated on
  install via the `postinstall` script).

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `i` | New idea |
| `j` / `k` | Navigate down / up |
| `h` / `l` | Navigate left / right |
| `Enter` | Open card menu |
| `e` | Edit selected idea |
| `Esc` / `q` | Close menu / deselect |
| `q` | Close dialog |
| `e` | Open settings |
| `d` | Toggle light/dark theme |
| `Ctrl+E` / `Cmd+E` | Expand / restore settings |
| `Ctrl+1` | Switch to Archived |
| `Ctrl+2` | Switch to Inbox |
| `Ctrl+3` | Switch to Trash |

---

## API Reference

Send ideas to Trojes from any tool that speaks HTTP.

### Authentication

```http
Authorization: Bearer trojes_your_api_key_here
```

Generate keys from **Settings → API Keys** (visible once on creation).

### Endpoints

**Create idea** — `POST /api/ideas`
```json
{ "content": "My brilliant idea" }
```

**List ideas** — `GET /api/ideas?status=inbox|archived|deleted&search=keyword`

**Update idea** — `PATCH /api/ideas/{id}`
```json
{ "status": "archived", "pinned": true, "background_color": "mint" }
```

**Delete permanently** — `DELETE /api/ideas/{id}`

<details>
<summary><b>Available background colors</b></summary>

`coral`, `peach`, `sand`, `mint`, `sage`, `fog`, `storm`, `dusk`, `lavender`, `blossom`, `rose`
</details>

### cURL Example

```bash
curl -X POST "http://localhost:3000/api/ideas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer trojes_your_api_key_here" \
  -d '{"content":"Idea from terminal"}'
```

---

## Tech Stack

| | |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, React 19) |
| **Database** | [Neon](https://neon.tech) (Serverless PostgreSQL via Drizzle ORM) |
| **Offline sync** | [PowerSync](https://www.powersync.com) (local SQLite mirror + bidirectional sync) |
| **Auth** | [NextAuth.js](https://next-auth.js.org) (Google OAuth) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| **Data fetching** | [SWR](https://swr.vercel.app) (API keys) + PowerSync `useQuery` (ideas) |
| **State** | [Zustand](https://github.com/pmndrs/zustand) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## Roadmap

### Goal — Trojes as an Idea Court

Capture is done. The roadmap is the **analysis layer**:

1. **Queue** — a visible inbox with a "thinking" prep state (transcription, distillation, web scan, tree generation) and a "ready" state that invites grilling.
2. **Grilling** — the interactive 8-branch interview (problem, who it's for, stakes, alternatives, feasibility, differentiation, what would kill it, next smallest proof).
3. **Web-by-default research** — anonymized scans that flag near-duplicate existing products as an early-stop risk.
4. **Verdict** — AI recommends, the user votes (pin / keep / archive); both the vote and the recommendation are stored.
5. **Runtime hybrid** — cloud analysis by default (zero config), with a path for the user's own LLM/agent to run the same steps.

Out of scope for v1: execution (no tasks, tickets, emails, or documents), integrations, and sharing. Those ideas are documented as dormant in `notes/research/trojes-product-model.md`.

For the product model, vocabulary, and design rationale, read [`notes/research/trojes-product-model.md`](notes/research/trojes-product-model.md).

Open to collaborate, feedback, or just a good idea — alwaaays learniiing.

---

## License

MIT — see [LICENSE](LICENSE).
