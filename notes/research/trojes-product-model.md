# Trojes Product Model

Trojes is an idea capture and action layer designed to record thoughts that arise in random moments, with the lowest possible friction and the greatest retention capacity. It is built on a small set of product primitives that can support multiple interfaces: a Progressive Web App (PWA), messaging platform integrations (WhatsApp, Telegram, etc.), widgets, an MCP server for AI agent connectivity, and a cloud sync engine.

This document is intentionally high level. It is not an architecture decision record and does not attempt to design every subsystem in detail. Its purpose is to establish the product concepts, vocabulary, and composition model that later research and architecture documents can build on.

## Goals

- Trojes should make it incredibly easy for users to capture ideas the moment they occur, removing every barrier and friction point. Never lose that "million-dollar idea.", or a simple "tomato to the lunch".

- The product should not require the user to structure, tag, or format the idea at capture time. Priority is raw, fast recording. Later, the system should provide easy paths (including AI assistance) to expand, classify, and act on those ideas — turning them into reality.

- The platform should be built from primitives that are stable enough to support all product interfaces and extensible enough that new processing capabilities can be shipped as plugins instead of requiring core changes.

## Product Surfaces

Trojes has five primary product surfaces.

### PWA / Web App (Control Center)

A Progressive Web App is the single control center and operations hub. It works on both mobile and desktop from the browser, requiring no installation or app store. On mobile it serves as the quick-capture surface (voice, text, photo, home screen widgets). On desktop it becomes the full operations workspace for reviewing, organizing, expanding ideas, and configuring integrations. This avoids native app fragmentation while delivering a near-native experience.

### MCP Server (Agent Access)

Trojes exposes an MCP (Model Context Protocol) server so AI agents — coding assistants, task automation agents, personal AI assistants — can connect directly to Trojes's idea and action model. An agent can query recent ideas, create new ones, trigger actions, or retrieve context. This makes Trojes a first-class tool in the agent ecosystem rather than just another note-taking app.

### Managed Cloud (Sync & AI)

The hosted product ensures ideas sync securely and instantly across all devices. Additionally, the cloud provides the computational power to process voice notes, auto-generate tags, and suggest next steps through AI agents.

### Offline / Local-First

The architecture must work offline by default. Lack of connectivity should never prevent capturing an idea. Ideas are stored locally and sync to the cloud as soon as a network becomes available, ensuring the same fluidity regardless of environment conditions.

### Messaging Inputs (Zero-Friction Capture)

To further reduce friction, Trojes accepts idea submissions through messaging platforms users already have open: WhatsApp, Telegram, and similar channels. A user can send a voice note or text to a Trojes bot and the idea is captured instantly — no app switching, no new tab, no learning curve. This is the ultimate zero-friction path because it lives where the user already communicates.

## Core Concepts

Trojes is built around a small number of concepts.

### Ideas (Nodes)

An idea is the fundamental unit. It can come from a text snippet, a voice note, an image, or a link. Ideas do not require a strict input schema; they are the lowest-level product object the user creates.

### Contexts

Context is all the metadata automatically collected when an idea is captured: location, time, weather, current device activity, etc. Contexts help the user recall and structure the idea after the fact without requiring manual effort at capture time.

### Actions (Execution)

Actions are units of work that transform an idea into something more. They can be tasks like "create a Jira ticket," "draft an email," or "expand into a Notion document."

### Scopes

Scopes define ownership and visibility for ideas and their contexts. A user can have a personal scope, a work scope, or project-specific scopes. This separates ephemeral everyday notes from business ideas, and allows sharing the latter with a team if needed.

### Plugins (Integrations)

Plugins are a core product concept. They are how Trojes avoids becoming a silo and instead connects with the rest of the user's productivity ecosystem. They allow sending ideas to other platforms, enriching them with external data, or applying specific AI models.

## Plugin Strategy

Trojes should be extensible by default. When a capability is important but not essential to the quick-capture system, it should be considered a plugin candidate.

### First-Party Plugins

These are maintained by the Trojes team. They provide common integrations (e.g. Notion, Trello, Calendar, voice transcription engines) without forcing those capabilities into the base application.

### Third-Party Plugins

These can come from users, vendors, or the community. They allow Trojes to cover specialized workflows. They should be treated as untrusted by default, requiring explicit permissions to access ideas or execute actions.

## Capability-Based Access

Trojes should lean toward a capability-based permission model for integrations and AI agents. A plugin should only be able to read ideas or modify scopes it has been explicitly authorized for.

## Local and Cloud Parity

Trojes should aim for the same conceptual architecture locally and in the cloud. Actions that process ideas should be able to run on-device (e.g. small on-device language models for privacy) or be delegated to the cloud (for heavy tasks or API sync), maintaining a unified experience.

## What Trojes Enables

Trojes is agnostic to the final workflow the user builds on top of their ideas.

### AI-Powered Idea Expansion

An agent connected to Trojes can take a rushed voice note, transcribe it, structure it into a project format, and suggest next steps.

### Automated Workflows

Trojes enables simple rules: "If I capture an idea with the 'shopping' tag, automatically add it to my Notion list."

### Interaction Scripts

Through action execution, users can turn Trojes into a control panel to launch processes by simply expressing their intent.

## Competitive Positioning

Trojes's greatest inspirations are **Google Keep** and **Fizzy** (by 37signals/Basecamp). From Keep it inherits the ultra-fast capture philosophy, one-tap voice notes, clean visual cards, and the obsession with reducing friction to near zero. From Fizzy it takes the visual design sensibility: minimal card layout, restrained typography, generous whitespace, and a calm, uncluttered aesthetic. But Trojes aims to surpass both on two fronts: the post-capture action ecosystem (not just archiving, but transforming the idea into something executable) and contextual intelligence (location, time, proactive suggestions).

Trojes also coexists with products like Apple Notes, Evernote, Todoist, and Notion, but should not copy any of them directly.

While Notion is excellent at structuring work, Todoist at managing it, and Keep at capturing it on the fly, Trojes competes on **capture speed and the transition to action**. Its strategic advantage is being the universal inbox layer that, through context and intelligence, routes the raw idea to the right place. The product should compete on zero friction, extensibility, offline-first, and active assistance, rather than trying to be a full-featured word processor.

## Deeper Research Topics

The concepts in this document are part of the product model, but each needs a deeper follow-up research document before implementation decisions are finalized.

Important follow-up topics include: messaging bot integration (WhatsApp, Telegram APIs), MCP protocol and tool design, PWA offline capabilities and install experience, local storage optimization (offline-first), CRDT sync for the cloud, on-device NLP engines, plugin API design, idea security and privacy, and the structure of context metadata.
