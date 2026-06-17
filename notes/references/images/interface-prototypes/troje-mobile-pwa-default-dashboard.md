# Troje Mobile PWA Default Dashboard

Image file: `troje-mobile-pwa-default-dashboard.png`

## Overview
This image is a low-fidelity wireframe detailing the primary user interface (UI)
layout of the Troje Mobile Progressive Web App (PWA). It maps out the core
workspace optimized for rapid, frictionless idea capture and immediate feed
review.

## Visual and Product Elements
- **Top App Header**: Features the product name "Troje", a central circular
  asset placeholder, and a "Download" utility text button on the far right.
- **Frictionless Capture Field**: A prominent, high-priority input box situated
  directly underneath the top header with the placeholder text
  `+ Capture a new idea...`. This serves as the single raw input zone for typing
  notes immediately upon opening the app.
- **Top Fixed Bar**: A persistent navigation strip located right below the
  capture input, split into three view filters: `Archived`, `Ideas` (main active
  feed), and `Trash`.
- **Idea Feed Stream**: A vertical stack of four blank, rounded-corner
  rectangular cards. These cards represent the individual captured ideas (Nodes)
  and reflect the clean visual card philosophy inspired by Google Keep.
- **Bottom Fixed Bar**: A persistent utility menu docked at the bottom of the
  viewport containing quick action endpoints for `pin`, `Search`, and `Settings`.

## Agent Interpretation & Context
Future AI agents interacting with this interface model should interpret it as the
**Default Universal Inbox View**.
- Any unstructured data or raw text captured on the fly via quick-capture
  integrations should natively populate this core stream as a new rounded card
  component.
- The primary interaction point for incoming user streams is the upper input box.
- Navigation context shifts (switching from active ideas to archived logs) occur
  via the top fixed segment, while global utility configuration occurs at the
  bottom fixed bar coordinates.