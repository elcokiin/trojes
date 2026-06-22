# References

This file is the project registry for external references that may inform future
implementation decisions: inspiration repos, product examples, technical docs,
articles, package references, design references, or URLs provided by the user.

When adding a reference, include the source, why it matters, and which part of
Troje it may influence.

## Organization Strategy

References are organized first by artifact type, then by purpose or domain when
needed. This keeps storage rules clear: images can be committed with local
descriptions, source repositories stay link-only so the project does not become
large, and documents/articles can be tracked as notes or URLs.

## Local Reference Folders

### `notes/references/images/`

Checked-in visual references. Every image must have a sibling Markdown file with
the same basename that explains what the image shows, its relevant UI or product
elements, and how future agents should interpret it if they cannot view the
image directly.

Current image subfolders:

- `notes/references/images/interface-prototypes/`: original Troje screen
  concepts, UI sketches, and product-surface prototypes. Includes the default
  universal inbox view and the contextual CTA dashboard view with a temporal
  enhancement banner for PWA installation.
- `notes/references/images/product-inspiration/`: visual inspiration from other
  products, examples, taxonomies, or interface patterns. Includes the Memos
  positioning phrase reference for copy that defines a note product by what it
  intentionally is not: not a workspace, and not a second brain. Also includes
  `fizzy-pins/`, which captures Fizzy's bottom-left pinned tray in collapsed and
  expanded states for Troje's desktop pinned UI.

### `notes/references/source-repositories/`

Link-only references to GitHub, GitLab, or other source repositories. Do not
commit cloned repositories here. Store the repository URL, what to inspect, why
it matters for Troje, and any useful notes so a future agent can clone it into a
disposable location when needed.

Current source repository references:

- `git@github.com:elcokiin/Andean-Water-Stress-Simulator.git`: design reference
  for Troje's settings dialog structure, especially the configuration modal with
  a persistent header, sidebar navigation, scrollable content, footer actions,
  and `Mod+E` expand/restore behavior. Inspect in a disposable clone; do not
  commit the repository.

- `https://github.com/basecamp/fizzy`: Fizzy by 37signals/Basecamp — helped
  with visual design decisions, e.g. the bottom bar style. Cloned to
  `notes/references/source-repositories/fizzy/` and gitignored.
  
  **Pinning analysis (June 2026):**
  Fizzy uses a separate `pins` join table (`card_id` + `user_id`), NOT a boolean
  column on `cards`. Pins are **fully separated** from the main card grid — they
  live in a persistent bottom tray/drawer opened by a toggle button with `P`
  keyboard shortcut. Ordering is `created_at DESC` (most recently pinned first),
  no position/reorder column. The pin button on each card is lazy-loaded via
  Turbo Frame. Pins auto-clean when users lose board access.
  
  **Key differences from Troje:**
  - Fizzy: per-user pins via join table | Troje: global `pinned` boolean on idea
  - Fizzy: completely separate UI (bottom tray) | Troje: inline sections
  - Fizzy: reverse chronological order | Troje: no sort order
  - Fizzy: max ~10 visible items | Troje: no limit
  - Fizzy: Hotwire real-time updates | Troje: no real-time pin updates
  
  Relevant files in clone:
  - `app/models/pin.rb` — model with `ordered` scope
  - `app/models/card/pinnable.rb` — `pin_by`/`unpin_by`/`pinned_by?` concern
  - `app/controllers/cards/pins_controller.rb` — 3 actions (show/create/destroy)
  - `app/controllers/my/pins_controller.rb` — index for tray (limit 20/100)
  - `app/views/my/pins/_tray.html.erb` — dialog with Turbo Frame + keyboard nav
  - `app/views/my/pins/_pin.html.erb` — card preview + unpin button
  - `app/views/cards/pins/_pin_button.html.erb` — lazy-loaded toggle button
  - `app/assets/stylesheets/trays.css` — `.tray__item--pin` styling (lines 366-424)
  - `config/routes.rb` — line 90 (card pin resource), line 186 (my pins collection)
  - `db/schema.rb` — pins table (lines 422-432)

### `notes/references/documents/`

References to articles, specs, PDFs, technical docs, research notes, or other
written sources. Prefer storing source URLs and short notes instead of copying
large files into the repo unless the user explicitly asks for a local copy.
