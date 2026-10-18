# Soya Travel Calendar — 山河有期

Explore seasonal travel ideas and create your own private destination list in your browser.
选一段假期、看看当季风景，把想去的地方保存成自己的旅行清单。

[中文说明](README.md) · Version 0.2.1 · Early preview

**[Open the online app](https://scenicdue.com/)**

Example: choose four days in late October and a CNY 8,000 per-person budget to explore seasonal ideas. Open 我的 (“My”) in the top-right corner, choose 我的地点清单 (“My places”), then 新建地点 (“New place”) to record a synthetic “Coastal walk,” preferred months and a note. You can edit, search, mark it visited and optionally locate it on the globe. The example is a practice record, not a verified real attraction.

![Synthetic personal-list example](docs/images/personal-list.png)

## Your first visit

No GitHub account, payment or identity-document upload is required. Use a recent Chrome, Edge, Safari or Firefox. **The app interface is currently Chinese; this guide names the exact buttons to click.** Availability of the hosted app varies by network; an offline alternative follows.

1. Open the online app above. Open 我的 (“My”) in the top-right corner, then 我的地点清单 (“My places”) for creation, 导入清单 (import) and 导出备份 (backup).
2. Click 新建地点. Enter 地点名称 (place name) and 国家或地区 (country/region), optionally add a note, then 保存地点 (save). Months, source link and coordinates are optional. To place a marker, provide both 经度 (longitude) and 纬度 (latitude).
3. Seeing your record in the list means it was saved. 编辑地点 edits it; 状态 chooses 想去 (want), 计划中 (planned) or 去过 (visited). 删除地点 removes it; 撤销上一步 undoes the last list change while the manager stays open. Before closing, clearing browser data or changing devices, use 导出备份 to download a backup.
4. On another device, open the same version and use 导入清单 to select that JSON backup (a text file holding your places). Review the additions/duplicates, then click 确认导入. Duplicates match country+name and are skipped; existing notes are not overwritten.

心愿单 (“Wishlist”) saves built-in travel ideas; 我的地点清单 manages your own entries; 本次行程 (“Current trip”) combines built-in ideas for the chosen dates. Custom places do not yet have automatic flight/hotel budgets, entry-policy assessments or full itineraries.

## From a country to a particular place

Click a country name on the globe, or 国家与地区 (“Countries and regions”), search a name and choose 探索… (“Explore…”). The right column lists city guides and individual sights. 自然 / 人文 filter nature/culture. Bookmark a card for the wishlist; this is separate from adding a city to the current trip.

Try searching 老挝 (Laos), choose 探索老挝, then open 相通寺 or 光西瀑布. Detail cards explain what to notice, historic use, people/events, approximate Chinese historical parallels and evidence. City guides also contain individual sight cards and return to their original guide when closed.

Perennial cultural experiences stay visible; nature uses month/date windows, with separate spring/autumn Su Causeway cards. Exhibitions use actual dated windows. Flowers/tides need current confirmation. Perennial value does not mean daily opening or comfortable weather in every season.

Public content covers34 countries/regions,72 destinations and175 point records (176 seasonal cards), including22 newly checked detailed points;26 food experiences across13 regions and8 pre-trip reading entries across4 places are included. The footer’s “每一程心动，都有来处” opens country counts and182 URL-deduplicated references with per-use verification states. Five pre-trip articles were read; three books were checked at catalogue level only. **Coverage does not mean complete or fully reverified guides.** The258 map units are counted separately. The UNESCO batch index is not distributed or counted while republication terms remain unresolved. See [knowledge-base notes](docs/knowledge-base.md).

Destination cards include local food and pre-trip reading, with official references, original editorial suggestions and questions to notice on site. Destinations without checked enrichment show a clear pending note.

## Photo-assisted entry

Optional document assistance: open 我的 (“My”) in the top-right corner, then 护照与签证 (“Passport and visas”), select a passport/visa image, choose 在本机识别照片 (recognize locally), correct the preview, check the confirmation box, import, then 保存出行资料 (save). Cancel leaves saved data unchanged. Clearing fields also requires confirmation and saving.

Only travel dates, visa type, entries and stay duration are retained. No name, birth date, ID number, original scan or raw OCR text is stored or uploaded. Best-effort recognition covers English labels, Korean grant notices and TD3 passport MRZs; other layouts or blurry images may require manual entry. JPG/PNG/WebP up to10 MB; the single-file download retains manual entry only. About7 MB of same-origin engine/language resources load on first recognition. No OCR account or paid API is required. Photo OCR is available in the online version; the single-file download retains manual document fields. See [Privacy](PRIVACY.md).

## If the online app will not open

Visit the [0.2.1 fixed download page](https://github.com/soyoungzsy/soya-travel-calendar/releases/tag/v0.2.1). Under Assets, download **Soya-Travel-Calendar-v0.2.1.html**. Wait for the download, then double-click it or drag it into your browser. It includes photographs and is about 48.7 MB; opening it the first time can take longer than a normal page. Wait until the title and globe appear.

The offline file uses compressed destination photos to reduce download size; the hosted app retains larger originals. The artifact was tested through a local web preview; direct file opening was not automatically verified because the test browser permits only HTTP/HTTPS. The offline file needs no installation and includes the main interactions and dated fallback data. It cannot refresh reference data without a server. Local-file storage varies by browser; export a JSON backup before moving the file, changing versions or clearing data. Keep the old HTML file and backup to return to a previous version. If saving fails, check private-browsing/storage restrictions.

## Who it is for and what it does

For people collecting places they want to visit and turning a holiday window into a shortlist. It includes 73 photographed travel ideas, 14 detailed guides, 42 experience photos, a wishlist, a dated trip basket and preparation checks.

It does not replace booking providers, travel professionals or official entry rules. Budgets are planning scenarios and itineraries are generated from local reference data and allocation rules. There is no online LLM connection, sellable live inventory, Xiaohongshu private-favorites sync, cross-device account. Saving a source link does not read the note. Entry-policy examples cover mainland Chinese ordinary passports only; origin/budget examples use Hangzhou or Shanghai. Other passports/origins require separate checks. Your custom months are personal notes, not verified seasonal recommendations.

## Costs, accounts and data

The open-source code is free to use; the hosted preview and offline file require no account. Self-hosting can incur hosting/traffic costs. Future services have their own terms; this version does not purchase or enable paid services.

Places, notes, wishlist, trips and confirmed visa/expiry fields stay in the current browser. Place backups exclude passport/visa fields, cookies and account information, but do contain your place names and private notes. Browser storage is not an encrypted document vault.

The hosted app requests public central-bank FX references and Wikimedia pageviews for built-in public destination titles. It does not include your custom places, notes or identity fields in those requests. Hosting/data providers may receive normal network metadata such as IP and logs; zero third-party retention is not promised. External source links follow their own providers’ rules. Read [Privacy](PRIVACY.md).

## Backup and recovery

Up to 500 custom places; import files up to 2 MB. Imports are previewed; cancel leaves the list unchanged and repeated imports skip duplicates. Undo is one-step and lasts only while the manager is open. After closing it, recovery needs your exported backup.

The [synthetic sample](examples/my-places.sample.json) shows this project’s own format; it is **not an official Xiaohongshu export**. Clearing site data also clears wishlist, trip and profile fields. Export before upgrading or clearing data; deleted data without a backup cannot be restored. A different domain is a new browser origin. Place backups can be imported there; wishlist, trip and document fields are not included in that backup and currently require re-entry. Retain the old page and your records.

## Problems and support

- Globe missing: allow image loading and graphics acceleration. A lightweight fallback map is available when WebGL fails; the cards remain usable.
- Import rejected: use this project’s export format, check the 2 MB / 500 record limits and the error’s record number. No list changes are made before confirmation.
- Empty list on another device: there is no cloud sync. Import your backup and allow browser storage.
- Report a reproducible issue through [Issues](https://github.com/soyoungzsy/soya-travel-calendar/issues) with version, browser, steps and sanitized screenshots. Never attach identity documents, private backups or keys. Response time is not guaranteed. See [Security](SECURITY.md) for sensitive reports.

## For developers: run or contribute

Ordinary users can skip this section. Install Node.js 22.12+ and Git. Download the [fixed source ZIP](https://github.com/soyoungzsy/soya-travel-calendar/archive/refs/tags/v0.2.1.zip), unzip it, open Terminal, type `cd ` with a trailing space, drag the extracted folder into Terminal and press Enter. Run these one line at a time:

```sh
npm ci
npm run build
npm test
npm run dev
```

Open `http://127.0.0.1:5173/` when it appears. Stop with Ctrl+C in Terminal. Installation needs internet; the project uses the public npm registry. `npm run build` creates hosting files. See [Development/deployment](docs/development.md); the author’s hosting identity is not included.

Read [Contributing](CONTRIBUTING.md) before code or public-data changes. Private lists do not belong on GitHub. Public contributions need sources and image rights and are reviewed separately. Future AI changes should use branches and pull requests (reviewable change proposals), without automatic merging.

## Version, licensing and maintenance

Version 0.2.1 preview: [Changelog](CHANGELOG.md), [fixed release](https://github.com/soyoungzsy/soya-travel-calendar/releases/tag/v0.2.1), [MIT code license](LICENSE), [third-party notices](THIRD_PARTY_NOTICES.md). Media keeps its own licenses and is not relicensed MIT; [photo credits](docs/media-credits.md). A publicly visible social post is not permission to copy its photos.

Export before updating; retain the previous file and backup for recovery. Delete downloaded project files to uninstall; clear browser data separately if desired. Removing a public repository/release cannot recall copies already downloaded. See [Release review](RELEASE_REVIEW.md) for actual checks and unverified areas.
