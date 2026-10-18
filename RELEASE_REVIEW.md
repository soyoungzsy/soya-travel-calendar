# Release review / 发布检查

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
