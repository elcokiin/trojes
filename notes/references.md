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
  concepts, UI sketches, and product-surface prototypes.
- `notes/references/images/product-inspiration/`: visual inspiration from other
  products, examples, taxonomies, or interface patterns. Includes the Memos
  positioning phrase reference for copy that defines a note product by what it
  intentionally is not: not a workspace, and not a second brain.

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

### `notes/references/documents/`

References to articles, specs, PDFs, technical docs, research notes, or other
written sources. Prefer storing source URLs and short notes instead of copying
large files into the repo unless the user explicitly asks for a local copy.
