# Roadmap

> **Ideas / Future Work — NOT implemented.**
> Everything below is a brainstorm of possible future directions, captured during development. None of it exists in the app today. For what's actually shipped, see `docs/FEATURES.md`. Do not treat anything in this document as a current capability.

## Why this list exists

During development the team brainstormed ways to make the project stand out beyond the core offline-first requirements. These ideas range from small polish items to significant AI/ML features that were never built. They're recorded here purely as a backlog of possible future directions, not a description of the product.

## Bigger ideas (not built)

- **AI-powered disaster classification** — auto-suggest incident type and severity from a submitted photo (e.g. via TensorFlow.js or a cloud vision API), with the responder confirming or overriding the suggestion.
- **Voice commands** — hands-free reporting ("report flood at current location", "take photo and submit") for use in conditions where typing is impractical (gloves, rain, urgency).
- **Real-time analytics/heat-map dashboard** — incident density heat maps, trend charts over time, and pattern-based "high-risk zone" callouts on the HQ dashboard.
- **Push notifications / emergency alerts** — broadcast critical incidents to all responders via Firebase Cloud Messaging, including when the app is closed.
- **Advanced map features** — marker clustering for dense incident areas, route optimization to reach multiple incidents, satellite/terrain map layers.
- **Multi-language support** — Sinhala/Tamil/English localization, relevant given the project's Sri Lankan context.
- **Advanced photo analysis** — EXIF-based location extraction from photos, AI-estimated damage scoring, photo annotation tools.
- **Real-time responder collaboration** — live location sharing between responders on the map, in-app chat, shared notes on an incident.
- **Predictive analytics** — modeling likely future disaster locations from historical incident data, weather, and terrain.
- **Smart resource/responder allocation** — suggesting which responder to assign to which incident based on distance, skills, and current workload.

## Smaller polish ideas (not built)

- Automatic dark/light theme switching based on time of day (today the toggle is manual only, with the chosen preference persisted per device — see `docs/FEATURES.md`).
- Downloadable/cached offline maps beyond the current "tiles you've already viewed get cached" behavior.
- QR-code based incident sharing between responders.
- Audio feedback / voice confirmation for key actions (e.g. "incident saved successfully").
- Exporting incident data to PDF/Excel for reporting.

## How to read this doc going forward

If any of these get built, move that item out of this file and into `docs/FEATURES.md` (or a new dedicated doc) with an accurate description of what actually shipped — don't just delete the line here and call it done. Until that happens, this file stays a wishlist, not a status report.
