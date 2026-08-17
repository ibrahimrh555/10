# Design QA — Exploration mobile

- Source visual truth: `docs/design-references/Terrain Pulse _ exploration mobile des matchs.png`
- Source pixels: 1536 × 1024 (composite containing six 393 px-class mobile states)
- Implementation routes: `/explore`, `/games/[gameId]`
- Intended CSS/mobile viewport: 393 × 852, density 1
- State coverage: data, loading, error, empty/filtered empty, filters open, available/full/joined/host/not-found detail
- Implementation screenshot: unavailable
- Browser-rendered evidence: unavailable; Expo Metro started successfully, but web export did not complete within the 120-second validation window and no local browser capture capability is exposed in this session.
- Primary interactions statically/test verified: search, period/format/free/availability filters, reset, card-to-detail routing, detail-state selection.
- Console errors checked: blocked without a browser-rendered session.

## Full-view comparison evidence

Blocked. The source image was opened and inspected, but a same-viewport implementation screenshot could not be captured. Code follows the visible hierarchy, palette, card density, filter sheet structure, fixed navigation, hero detail and sticky action shown in the reference.

## Focused-region comparison evidence

Blocked for the same reason. No pixel-level claim is made for typography, spacing, crop or small-screen wrapping.

## Findings

- P1 — Rendered mobile comparison unavailable. Visual fidelity, Android rendering and compact-screen wrapping still require a device or browser capture.
- P2 — The provided source is a six-state composite rather than separate full-resolution screen captures, limiting exact pixel measurements.

## Comparison history

- Initial pass: source opened at 1536 × 1024; implementation capture unavailable, so no fix-and-recapture loop was possible.

## Required fidelity surfaces

- Fonts and typography: mapped to the existing display/body tokens; rendered comparison blocked.
- Spacing and layout rhythm: mapped to existing spacing/radius tokens; rendered comparison blocked.
- Colors and visual tokens: mapped to the existing green/ivory semantic theme; rendered comparison blocked.
- Image quality and asset fidelity: reused the existing football-pitch raster; rendered crop comparison blocked.
- Copy and content: matched to the French reference and requested states.

final result: blocked
