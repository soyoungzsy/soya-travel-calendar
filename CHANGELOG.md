# Changelog

## 0.5.0 source — 2026-10-21

- Add selected-date flight/hotel query workbench, separate outbound/return conditions, bounded nearby-date samples, and honest copy-to-platform fallback. Formal FlyAI access remains unverified and disabled by default.
- Add fixed-endpoint MCP adapter with schema validation, strict route/date matching, preserved supplier notices, no trial credentials, and D1 global call budget. Never turn planning budgets into quotes or hotel display prices into confirmed totals.
- Generate a browser-local, printable A4 PDF travel book from the same itinerary and knowledge records: suggested time blocks, cultural context, food, reading, transport/stay guidance, preparation and sources. Embed a licensed multilingual subset font on demand.
- Use available 16-day representative-point forecasts only for matching local visit days; keep seasonal references and transit days distinct. Add regression checks for route preservation, wrong supplier products, privacy and PDF text coverage.
- Deployment is separate from this source release. Free Tencent candidate and formal OTA activation are not claimed complete.

## 0.4.0 — 2026-10-20

- 新增可选、同源的使用统计：浏览器访客、点击、前台有效停留、跨日复访与有序操作路径。
- 新增所有者私有访问报表、日期筛选、趋势与排行、日报导出；使用 Sites D1，测试流量单独隔离。
- 所有者访问排除出真实流量；公开目录ID白名单、同源限制、去重与限流，不采集输入内容、私人地点或证件。
- 使用随机浏览器标识，服务端加盐后存储；90天数据保留与统计关闭入口。没有回填上线前历史。
- 种子用户阶段暂停新增ECS费用，使用量只触发评估提醒，不自动付款。

- 新增独立旅行百科页，按大洲、国家、城市浏览；与年历共用目录、ID与收藏。修复国家目录重复的澳大利亚地理单元。
- 补入贝加尔湖、赛里木湖、漠河六张夏冬卡片及对应实拍；美食31项中29项取得实拍、2项保留许可缺口。
- 攻略景点改为稳定的纵向图文阅读，删除重复展开/收起；小型来源气泡不再被弹窗裁切。
- 重新核验OTA接入：FlyAI免费个人开发者路径及一次官方体验查询有证据，正式网站仍待授权和托管适配，不把预算当实价。

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
