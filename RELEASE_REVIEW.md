# Release review / 发布检查

## 0.2.1 navigation and link patch — 2026-10-18

The top-right 我的 disclosure groups personal places (create/import/backup) and passport/visa settings. No data schema or storage key changes. README online links and the canonical URL use scenicdue.com; v0.2.0 stays immutable. Production build and64 tests passed. Browser review verified the My disclosure, personal-list import control, passport/visa navigation, Escape/focus return and outside-click dismissal. The viewport provider did not apply the attempted small-screen override, so that specific check is not claimed. Final public-link and deployment evidence is recorded in the patch release receipt.


## 0.2.0 candidate — 2026-10-18

Author display: Soya. Public changes include country exploration, sourced point/season cards, local food, pre-trip reading, computed coverage/reference disclosure, brighter historical globe and a desktop2:1 map/card layout. Previously committed browser-local document assistance is included; no real identity files are part of this release.

64 automated tests passed after a production build. Added checks cover coverage/season deduplication, source-use status isolation, destination-food mapping, book catalogue versus article reading states, disputed batch-index exclusion and existing point/season rules. `knowledge:check` is an offline structural check, not an external source recheck. Browser review verified country selection, searchable reference bibliography, per-country statistics, actual Luang Prabang scenery/food/reading display and wishlist round-trip. Responsive review at1280px and375px verified2:1 desktop columns, stacked food cards,22px phone title and no horizontal page/dialog overflow. Release/source verification is recorded in the final release receipt after publication.

Current public content:34 content countries/regions (including travel areas),72 unique destinations /73 seasonal destination cards,175 point records /176 season cards,22 newly checked detailed points,26 food experiences across13 regions,8 reading entries across4 places,182 URL-deduplicated content references.80 references have at least one recorded body check; that does not upgrade other unchecked uses.3 books are catalogue-only,5 pre-trip articles were read.258 map units are not counted as content countries. No claim of global completeness or all-source current verification.

UNESCO batch data is excluded from source, build and portable artifact while republication terms remain unresolved. Official single-page links may remain citations. No original full text, book chapters/covers or unlicensed new photographs are imported. Five additional licensed photographs and a historical NASA cloud layer retain accurate provenance; EXIF/XMP/IPTC/comment metadata was removed without recompressing pixels. Private document archives, Aliyun identity/checkout/DNS records and account data stay outside this repository.

All changes must use a fixed new tag and formal release; never overwrite v0.1.0. The new portable asset and checksum identify its tested bytes. CI remains a read-only pinned example, not an enabled workflow. The original scanner limitation below still applies; do not report a Gitleaks pass. Direct file:// launch, physical trackpad/audio feel and independent human usability testing remain unverified.

# Historical 0.1.0 review / 历史检查

Release candidate:0.1.0. Checked2026-10-18. Project author display:Soya. This public copy has a fresh history; the original private workspace/Git history and hosted-site identity are excluded.

## Functional evidence

42 automated checks cover travel logic plus personal-list persistence, edit/restore, duplicate skipping, conflicting IDs, unsafe links, invalid/oversized inputs, storage failure, export field allowlisting and map scope. Browser checks used synthetic records only: create/save, edit/visited filter, export feedback, map locate, reload persistence, delete and undo; console error list empty. The standalone artifact was rendered through a local HTTP preview and saved a synthetic place. Direct file:// opening was rejected by the browser protocol policy and was not bypassed. The native file-chooser path and physical trackpad/audio feel were not fully tested. Core import parsing/merge/size/privacy cases are tested directly.

## Public data boundaries

No account cookies, passport scans, identity numbers, private personal-place exports, local filesystem paths or corporate endpoints are intended in this tree. Images were inspected for EXIF/XMP; none of the packaged images retained those fields. Photos keep author and license metadata; see THIRD_PARTY_NOTICES.md. Hosted reference requests use bundled public destination titles, not private custom places.

The official Gitleaks8.30.1 archive checksum was verified, but its scanning command terminated with exit137 even on README alone; it produced no trustworthy scan result. No device/security setting was changed to force it to run. A separate local pattern scan and semantic review cover all tracked text and every commit/blob in the fresh publication history; binary-image metadata was checked separately. Exact scope/counts are recorded in the release receipt. This is a limited review, not a comprehensive security guarantee. Dependency audit initially had network failures, then completed and found6advisories; compatible patches were applied(Vite6.4.4 and transitive updates), and the final npm audit returned0vulnerabilities on2026-10-18. CI is supplied as a pinned, read-only example in docs/ci.example.yml; it is not an enabled workflow in this initial release. Current publishing credentials do not include workflow-write scope.

## Release and recovery

package.json is the version source. Fixed tag v0.1.0 and the formal release point to the tested source. Downloadable app file has a SHA256 checksum. Verify public repository, tag, release and source after actual publication; the final release description records those results. Do not move a published tag or silently replace the app attachment.

Export a personal-list backup before updating or clearing browser storage. Restore by importing your JSON backup; existing duplicates are skipped without replacing notes. Keep the previous HTML file for an offline rollback. Reverting code does not recover erased browser data. No data deletion or cloud migration is performed by publication.

## New-reader review

Both language entries explain purpose, a synthetic example, the exact Chinese buttons, no-account/cost conditions, local storage, export/import, offline download, failure recovery and limitations. The English guide explicitly states that the interface is Chinese. Review after publication must use the actual public README and release; it is an AI self-review, not independent user testing. Post-publication results appear in the release description/receipt.

Known limits:no Xiaohongshu private-folder sync, no OCR, no cloud accounts, no live sellable inventory or online LLM; custom places are personal notes and map markers, not fully validated travel itineraries. Policy/season/FX/budget references need dated verification.

## 0.3.0 usability/content revision — 2026-10-19

The map now uses a rectangular viewport with matched WebGL, label, hit-test and cursor-anchor math. Wheel/pinch cancellation is scoped to the map region (including its controls and zoom bounds); page zoom outside the map remains available. Numeric projection/anchor/bounds cases are covered by tests. Physical trackpad/audio feel remains a manual-device check, not a claimed automated pass.

The city guide expands point details inline. Browser review at1280px and375px verified one open dialog, responsive one-column point details, country/city labels, Quanzhou facts/foods/programmes, Hong Kong five-point coverage, no domestic entry section, help Escape dismissal without closing the guide, no horizontal page overflow, and the My disclosure. An actual click on Edinburgh’s reference opened the correct VisitScotland new tab. The feedback form opens a mailto draft for the visitor to send; no email was sent during testing and no automatic delivery service is claimed.

A contact-sheet review covered115 existing destination/experience photo associations;8 new representative POI photographs were individually decoded/inspected. Known incorrect species/lake/season mappings were removed. Wuyuan’s autumn cover is not used for its spring card; two unillustrated Hangzhou culture points retain text guides rather than unrelated images. Every currently associated local image file and credit link is structurally checked. New photographs have no EXIF fields. Permission and source metadata remain separate from the MIT code license.

Public source review excludes private scans, OCR output, local archives, account/DNS credentials and user place exports. The only new personal contact is the exact public feedback email explicitly supplied for this purpose. Stored data formats and keys are unchanged.394 prior outgoing URLs were checked; confirmed hard404 and deleted-page redirects were replaced/removed. Access-limited and timed-out URLs were not presented as reachable; a reachable source does not certify every factual claim. Updated sources and factual coverage are described in docs/knowledge-base.md.

The candidate public README and download instructions were reread from a first-time reader’s perspective as an AI self-review, not an independent human usability study. They point to the canonical custom domain, distinguish browser-local lists from server accounts, state book/programme reading limits, and reference an immutable new release. Production build then67 tests pass; updated portable bytes and deployment are recorded in the release receipt after publication.
