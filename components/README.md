# Components Architecture

Keep `components/ui` as the shadcn/ui primitive layer. Product components should
live in a domain folder so the root `components/` directory stays small and
scannable.

## Domains

- `account/`: signed-in user controls and account-specific UI.
- `app/`: top-level app shell and page composition components.
- `branding/`: reusable Trojes identity elements.
- `ideas/`: idea capture, idea cards, idea lists, and idea workflow UI.
- `providers/`: client providers and browser-side app bootstrapping.
- `settings/`: settings dialog sections and settings-owned controls.
- `shortcuts/`: keyboard shortcut display and help surfaces.
- `ui/`: shadcn/ui components and low-level primitives only.

When adding a component, prefer the narrowest domain that owns the behavior. Add a
new domain folder only when a product concept does not fit one of the existing
folders.
