# Changelog

## 0.3.1 — 2026-10-19

- 100% now fits the full sphere inside both wide and tall map viewports; labels and pointer anchors use the same fitted radius.
- Replace the flat-map error path with an interactive Canvas2D globe. WebGL failure/context loss switches automatically; texture failure keeps a vector sphere. Rotation, inertia, zoom and place selection remain available.
- Stop native image dragging in the globe; prioritize the base texture and defer the optional cloud layer.
- Add a standalone Node static/API adapter and mainland deployment kit. This prepares migration; no mainland hosting, filing or VPN-free availability is claimed complete.


## 0.3.0 — 2026-10-19

- Expand the globe to its full rectangular viewport; keep projection, hit testing and pointer-anchored zoom aligned. Consume map wheel/pinch events at the map boundary, including zoom limits and controls.
- Replace ambiguous headings with functional names, add optional help, and expand sight details inside the current city guide. Omit irrelevant domestic entry and empty enrichment/quote-provider sections.
- Add representative, licensed POI photos; remove incorrect generic/species/season associations. Label point cards with country and city/region.
- Add sourced Quanzhou history, foods and pre-trip programmes, plus five Hong Kong points. Computed coverage:180 points,29 detailed records,31 foods,12 reading/programme entries,201 references.
- Audit394 existing outgoing URLs; replace confirmed broken/deleted source links and remove a gastronomy reference that now redirects to a homepage. Restricted and timed-out URLs are not claimed to be reachable.
- Move feedback to its own footer with the owner-authorized public email. Feedback opens a visitor-reviewed email draft; no server-side email delivery is claimed.


## 0.2.1 — 2026-10-18

- Move personal-place creation, import and backup into the top-right 我的 menu alongside passport/visa settings; remove the separate toolbar/footer entries.
- Use scenicdue.com for the Chinese/English online-app links, canonical URL, repository homepage and reference-service identification.
- Existing browser-local records and import preview/confirmation semantics remain unchanged.


## 0.2.0 — 2026-10-18

Country exploration and a sourced sight library / 国家探索与有依据的景点资料库。

- Click country names or search258 map units; browse city/point guides with independent wishlist bookmarks. UNESCO batch redistribution is disabled pending rights clarification.
-175 point records /176 season cards, including22 newly checked detailed records; historic use, people/events, field observations and approximate Chinese historical parallels.
- Computed library colophon:34 content countries/regions,72 destinations,175 point records and182 URL-deduplicated references; searchable coverage and per-use verification states.
-26 locally sourced food experiences across13 regions and8 pre-trip reading entries across4 places;5 articles read and3 catalogue-only books, clearly distinguished.
- Desktop globe/card split2:1, independently scrollable card panel; phone stacking.
- Perennial cultural value, spring/autumn landscape variants, fixed exhibition dates and conditional tide/flower checks are kept distinct.
- Smaller page title, brighter oceans, historical NASA cloud layer; versioned Natural Earth v5.1.1 map source and five licensed point photos with accurate subjects.
- Optional local passport/visa photo assistance, editable confirmation and allowlisted browser-only fields; original scans/raw OCR never enter the project, exports or server. Portable HTML keeps manual entry.
- Explicit, reviewable public-data refresh commands; existing personal-list export format remains compatible. Switching domains does not migrate browser-local data.

Limits: factual index coverage is not global guide completeness; many point photos and travel details remain unverified. No live ticket/hotel inventory, private favorites sync, cloud accounts or entry guarantee.

## 0.1.0 — 2026-10-18

First open-source preview / 首个开源试用版。

- Create, edit, search and remove browser-local personal destinations; mark want/planned/visited and choose months.
- Optional geographic coordinates place personal markers on the globe.
- JSON backup/import with preview, duplicate skipping, size/schema checks and one-step undo. Export excludes identity documents and account data.
- Seasonal globe, date/budget filters,73 photographed destinations,14 detailed guides, wishlist and dated trip basket.
- Chinese and English onboarding, third-party credits, privacy/security and contribution instructions.

Limits: Chinese UI; local-only lists without account sync; no Xiaohongshu favorites sync, passport OCR, real flight/hotel inventory, or automatic full itinerary for custom places. Reference prices, visa snapshots and model itineraries require verification.
