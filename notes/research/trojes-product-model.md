# Trojes Product Model

Trojes is an idea capture and **analysis** layer. It is designed to record thoughts that arise in random moments with the lowest possible friction, and then **grill** those ideas until the user knows whether they are worth pursuing. Capture is raw and instant; analysis is deliberate, interactive, and happens in a visible queue.

This document is intentionally high level. It is not an architecture decision record and does not attempt to design every subsystem in detail. Its purpose is to establish the product concepts, vocabulary, and composition model that later research and architecture documents can build on.

## Product Identity

Trojes's job is to take a raw idea and turn it into **clarity** — not execution. The product's signature is the **grilling**: an interactive interview that walks the user through a structured tree of questions, then produces a structured assessment and closes with a verdict. The user stays the decision-maker; Trojes is the interrogator and the researcher.

The previous model positioned Trojes as a capture **and action** layer ("from idea to executed task"). That framing is retired. Trojes does not execute anything, does not connect to other applications, and does not turn ideas into tasks. It only sharpens ideas. Whatever the user does with the sharpened idea happens outside Trojes.

## Goals

- Trojes should make it incredibly easy for users to capture ideas the moment they occur, removing every barrier and friction point. Never lose that "million-dollar idea", or a simple "tomato to the lunch".
- The product must not require the user to structure, tag, or format the idea at capture time. Priority is raw, fast recording.
- After capture, Trojes should help the user **understand** the idea: what it really is, who it is for, whether it already exists, whether it is feasible, and what would kill it. This analysis is the core value.
- The number of ideas the user actually evaluates should not be gated by the user's own patience for introspection. The queue runs analysis work automatically so that the moment the user opens an idea, the thinking has already started.

## Non-Goals (v1)

- **No execution.** Trojes does not create tasks, tickets, emails, or documents.
- **No integrations.** Trojes does not connect to Notion, Trello, calendars, or similar tools.
- **No autonomous judgment.** Trojes recommends; the user votes. Verdicts are only recorded when the user decides.
- **No sharing or ownership models.** Ideas are private by default in v1.

## Core Loop

```
captured → queued (auto or manual) → prep → ready → grilling (interactive) → verdict
                                          ↓
                          never queued / never grilled + no activity
                                          ↓
                                      auto-archive
```

### Lifecycle rules

- Capture is always zero-friction. Ideas are auto-queued for analysis in parallel by default. The user can disable auto-queue (per-user toggle) and, per idea, manually send it to the queue.
- Prep is automatic and runs while the user does nothing: transcription, distillation, web scan, and question-tree generation.
- Grilling is interactive and user-invoked: the user opens a ready idea and plays out the interview. Analysis is always two-stage; it never completes unattended.
- Un-grilled ideas stay "ready" with a visible nudge. The queue invites, it never nags, and it never forces.
- Ideas never queued, or queued and never grilled, with no activity for a set period (30 days by default, user-adjustable) move to the archive.
- No verdict is terminal. Any idea can be re-grilled at any time. Re-visiting is always manual; nothing is re-scanned automatically.

## Concepts

Trojes is built around a small number of concepts.

### Ideas (Nodes)

An idea is the fundamental unit. It can come from a text snippet, a voice note, an image, or a link. Ideas do not require a strict input schema; they are the lowest-level product object the user creates. Nothing is asked at capture time.

### Queue (Processing)

The queue is the visible inbox where analysis lives. It has two states of interest: ideas **in prep** (a "thinking" state while the pipeline runs) and ideas **ready** (prep finished, waiting to be grilled). The queue is the product's invitation to analyze — it makes the pipeline visible rather than hiding it in the background.

### Grilling (Interview)

Grilling is the interactive interview and the product's signature character. It is built from a **fixed skeleton of 8 branches** that the model instantiates and prunes per idea:

1. **Problem** — what change or need does this idea address?
2. **Who it's for** — user, segment, scale (personal, few people, market).
3. **Stakes / urgency** — if it is not built, what is actually lost?
4. **Alternatives** — what already exists and what they do worse (feeds the web pass).
5. **Feasibility** — does the user have the skill, time, and resources to make it?
6. **True differentiation** — genuinely new, or the same thing reshaped?
7. **What would kill it** — the devil's-advocate branch.
8. **Next smallest proof** — the cheapest experiment that validates, not the full build.

The skeleton is stable (2–4 questions per branch) but the model prunes branches the answers reveal are irrelevant. Because the skeleton is deterministic, a usable tree exists even if no model is available.

### Verdict (Decision)

A verdict is the end-state decision after grilling. The model presents its **recommendation**; the user votes among:

- **Pin** (do-it) — the idea graduates as an active decision.
- **Keep in primary** — stay in the primary view, undecided.
- **Archive** (dead idea) — the idea stops being active.

The user's vote is the authority. A verdict is only saved when the user votes, and the system keeps **both** the user vote and the AI recommendation, with timestamps — divergence between them is useful later.

### Contexts

Context is all the metadata automatically collected when an idea is captured: location, time, weather, current device activity, etc. Contexts help the user recall and structure the idea after the fact without requiring manual effort at capture time. Context also feeds the grilling — location and time can matter in the problem and stakes branches.

## Analysis System

### Two-stage pipeline

Analysis is split so that cheap, parallel work happens automatically and expensive, interactive work waits for the user:

1. **Prep-pipeline** (parallel, automatic): transcribe voice, clean the text, distill what the idea actually is, run the initial web scan, and generate a tailored question tree.
2. **Grilling** (interactive, user-invoked): the tree is played out question by question; answers reshape the tree, and the dossier and verdict compile at the end.

There is no unattended full analysis. Grilling is always interactive — otherwise the "tree of questions" is a fiction, since nobody answered them.

### Web-by-default

Web scanning is on by default. The idea is distilled into an **anonymized query** (never raw idea text) and scanned during prep. The scan can flag "this strongly resembles &lt;X&gt;" as an early-stop risk before the user invests minutes grilling a dead idea. Raw-text research stays opt-in per idea.

V1 cost guardrail: **one scan per idea, cached.** A re-grill re-scans only if the user opts in explicitly ("re-scan web"). No per-idea budget math; cache plus opt-in re-scan.

### Runtime: hybrid, cloud-first

- **Cloud by default**: the analysis runs in the managed cloud with zero user configuration. The user does not set anything up; Trojes runs the model and the analysis steps.
- **Local path (target)**: the user can point the same analysis steps at their own LLM or agent — an OpenAI-compatible endpoint (e.g. Ollama, LM Studio) is the pragmatic v1, and the deeper "run the same steps inside my own harness" path is a target for later. The mechanism for the deep path is not yet designed; it is expected to share MCP infrastructure.

## Product Surfaces

### PWA / Web App (Control Center) — active

The Progressive Web App is the single control center and operations hub. It works on mobile and desktop from the browser. On mobile it is the quick-capture surface (voice, text, photo, home screen widgets). On desktop it becomes the full operations workspace: the queue, the grilling sessions, the dossier, and the verdict. The grilling interview lives in the UI.

### Messaging Inputs (Zero-Friction Capture) — active, capture-only

Trojes accepts idea submissions through messaging platforms users already have open: WhatsApp, Telegram, and similar channels. A user can send a voice note or text to a Trojes bot and the idea is captured instantly. In v1 messaging is **capture-only** — the interview stays in the UI. A messaging-hosted grilling is a documented future option, not v1.

### Managed Cloud (Analysis & Sync) — active

The hosted product ensures ideas sync securely and instantly across all devices. The cloud runs the analysis pipeline (prep, web scan, tree generation, recommendation) — the default runtime.

### Offline / Local-First — active

The architecture must work offline by default. Lack of connectivity should never prevent capturing an idea. Ideas are stored locally and sync to the cloud as soon as a network becomes available. Offline capture is a hard requirement; offline analysis is limited to whatever the deterministic tree skeleton and local resources allow.

## Competitive Positioning

Trojes's greatest inspirations are **Google Keep** and **Fizzy** (by 37signals/Basecamp). From Keep it inherits the ultra-fast capture philosophy, one-tap voice notes, clean visual cards, and the obsession with reducing friction to near zero. From Fizzy it takes the visual design sensibility: minimal card layout, restrained typography, generous whitespace, and a calm, uncluttered aesthetic.

But the differentiator is no longer "capture plus action." It is **the grilling**: a disciplined, question-driven interrogation that most capture tools (Keep, Apple Notes) never offer, without the structure-first overhead of Notion or the task-management gravity of Todoist. Trojes competes on **capture speed and the transition to clarity** — it is the tool that forces the user to actually think about an idea before deciding whether it deserves to exist.

While Notion is excellent at structuring work, Todoist at managing it, and Keep at capturing it on the fly, Trojes is the **idea court**: capture, interrogate, recommend — and let the user pass the verdict. The product competes on zero friction, offline-first, web-backed research, and active questioning.

## Dormant / v2 Concepts

These concepts are documented to preserve the thinking, but are **out of v1 scope**. They are not designed in detail and should not be assumed to exist.

- **Actions (execution)** — units of work that transform an idea into tasks, tickets, emails, or documents. Retired from the active model; revisited only if the analysis layer ever wants to hand off a decided idea.
- **Plugins / integrations** — first- and third-party connectors to Notion, Trello, calendars, and the rest of the user's ecosystem. Kept as a concept because the ecosystem story may return, but untrusted-by-default, capability-based access applies if it does.
- **Scopes** — ownership and visibility models (personal, work, project, sharing). Deferred: v1 is private by default.
- **MCP server (agent access)** — exposing Trojes (and grilling) to AI agents. Kept as a concept because the local-harness path is expected to share this infrastructure.
- **Messaging grilling** — running the interview inside WhatsApp/Telegram. Capture stays; the interview remains UI-only for v1.
- **Local-LLM deep integration** — running the full grilling pipeline inside the user's own agent or harness (not just an OpenAI-compatible endpoint). Mechanism to be designed; expected to share MCP infrastructure.

## Deeper Research Topics

The concepts in this document are part of the product model, but each needs a deeper follow-up research document before implementation decisions are finalized.

Important follow-up topics include: queue lifecycle and the "thinking"/"ready" states; grilling tree design (8-branch skeleton, pruning rules, question generation); verdict semantics (pin/keep/archive, divergence between user vote and AI recommendation); web-scan privacy and cost (anonymized query distillation, caching, opt-in re-scan); PWA offline capabilities and install experience; local storage optimization (offline-first); the runtime hybrid (cloud pipeline vs. local endpoint and harness paths); on-device NLP engines; and the structure of context metadata.