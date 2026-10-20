# Privacy / 隐私

Personal destinations and notes stay in this browser under `shanhe-youqi-personal-v1`. Wishlist, query, trip and confirmed passport-expiry/visa fields use `shanhe-youqi-v3`. No login or account sync is implemented. This is browser storage, not an encrypted vault. Anyone with access to this browser profile may read it; private browsing, storage restrictions or clearing site data may remove it.

地点与备注保存在当前浏览器；心愿单、行程和已确认的证件字段也仅存本机。地点备份只导出个人地点，不导出护照/签证资料、Cookie或账号信息。地点备注仍是私人内容，导出后应自己保管。

Document-photo assistance is optional. A selected JPG/PNG/WebP image (10 MB maximum, 24 megapixels maximum) is decoded and recognized locally using Tesseract.js in a browser worker. Engine, WebAssembly and English language-model files are served from the same website under `/ocr/`; no remote OCR service, CDN fallback or AI API receives the photo. Model/engine requests still produce ordinary website traffic metadata. OCR caching is disabled. Neither the original image, its filename, image metadata, portrait, barcode nor raw OCR text is written to browser storage or a server by the app. A temporary image preview is released on removal, confirmed import, closing the panel or leaving the page. This releases application references, not a promise of forensic memory erasure.

照片辅助录入是可选功能：选择照片后在当前设备识别；先核对，再确认录入，最后点击“保存出行资料”。取消修改不改变已保存字段。程序只保存护照到期日、签证国家/地区、签证类型、签发日、到期日、单次/多次及单次停留天数；不会保存姓名、出生日期、证件号码、证件原图或识别全文。原图默认不归档、不上传，也不进入地点导出文件。当前识别基于英文标签、韩国签证批准信和TD3护照机读码；不支持的版式、语种、PDF或HEIC需要换图或手动填写。识别不保证准确，照片也不能验证签证真伪、剩余入境次数或入境资格。单文件下载版不含照片识别资源，需手动填写。

It does not read Xiaohongshu login cookies or private folders. Place export includes location names, coordinates, notes, source links and statuses; only share it after reviewing it. Import accepts the documented JSON schema and500 places / 2 MB maximum, previews additions and skips existing duplicate names/countries without overwriting notes. Deletions can be undone during the open manager session; keep an exported backup before clearing browser data or upgrading.

MRZ checks are not document verification. When the two date check digits pass but the full line does not, the preview explicitly labels the expiry as a candidate requiring close comparison with the original. Failed date checks leave the field blank. Raw name, birth date and document-number characters used during parsing are discarded rather than copied into the saved profile.

On a hosted/dev-server build, FX requests go to public central-bank data sources through `/api/fx`; Wikimedia pageview requests are for the bundled public destination titles through `/api/interest`. Personal locations, notes and identity fields are not included in these requests. Hosting providers and data providers may receive normal network metadata such as IP and request logs; this project does not promise zero third-party retention. External source links open their respective sites. Packaged photos are served with the app. No advertising SDK or third-party analytics script is included. Optional first-party product analytics are described below.

To remove document fields without deleting destinations: open 我的出行资料, choose 清空证件字段, confirm, then 保存出行资料. To remove personal places: open 我的地点, delete entries or first export a backup then clear this site's browser storage in browser settings. Clearing site storage also removes wishlist/trip/profile. There is no server account to delete. Do not paste passport scans, keys or private notes into public GitHub Issues.


## Optional product analytics / 可选使用统计

Visitors can allow or decline usage measurement in the small first-visit notice and change it from the footer at any time. Before permission, the application sends no analytics events and creates no analytics visitor identifier. Global Privacy Control defaults to disabled measurement. Downloaded file:// copies do not send usage analytics.

After permission, the app uses a random browser ID (rotated after90 days) and per-tab session IDs (30-minute inactivity timeout). A server-only salt hashes identifiers before storage in the Site’s D1 database. These are pseudonymous identifiers, not a guarantee of legal anonymization. The application records allowlisted public catalogue identifiers, predefined screen/action names, coarse viewport class, timestamps, capped foreground active duration, numeric load timings and generic error counts. It never sends IP addresses as event fields, full user agents, referrer URLs, URL query strings, input values, search text, personal-place IDs/names/notes, passport/visa fields, document filenames/photos or OCR output. The hosting provider still receives normal request metadata; this is not a zero-logging promise.

有效停留仅累计前台且最近60秒有操作的时间，15秒上报；关闭网页可能丢失最后一小段。统计基于明确允许且成功上报的浏览器，不代表真实人数；清理存储、换设备、屏蔽请求或打不开网页均会影响覆盖。没有上线前的历史行为数据，不回填虚构历史。

Analytics rows and daily aggregates are retained for up to90 calendar days; cleanup is applied when ingestion runs. During an extended period with no ingestion, expired data remains until collection resumes. Owner-authenticated visits are excluded from the live stream; explicit acceptance tests use a separate test stream and never count toward usage alerts. The owner-only report uses platform-verified sign-in headers and a server-held owner allowlist. It does not make personal travel data publicly accessible or add account synchronization.

关闭统计会停止后续上报、清除本机统计标识及未发送队列；此前已采集的记录按上述保留期清理，不承诺关闭即从服务器删除。原有个人旅行资料与OCR仍仅保存在浏览器，行为统计不包含这些资料。
