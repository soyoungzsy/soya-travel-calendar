# Privacy / 隐私

Personal destinations and notes stay in this browser under `shanhe-youqi-personal-v1`. Wishlist, query, trip and manually entered passport-expiry/visa fields use `shanhe-youqi-v3`. No login or account sync is implemented. This is browser storage, not an encrypted vault. Anyone with access to this browser profile may read it; private browsing, storage restrictions or clearing site data may remove it.

地点与备注保存在当前浏览器；心愿单、行程和手填证件字段也仅存本机。地点备份只导出个人地点，不导出护照/签证资料、Cookie或账号信息。地点备注仍是私人内容，导出后应自己保管。

The app does not collect passport numbers or document scans. It does not read Xiaohongshu login cookies or private folders. Export includes location names, coordinates, notes, source links and statuses; only share it after reviewing it. Import accepts the documented JSON schema and500 places / 2 MB maximum, previews additions and skips existing duplicate names/countries without overwriting notes. Deletions can be undone during the open manager session; keep an exported backup before clearing browser data or upgrading.

On a hosted/dev-server build, FX requests go to public central-bank data sources through `/api/fx`; Wikimedia pageview requests are for the bundled public destination titles through `/api/interest`. Personal locations, notes and identity fields are not included in these requests. Hosting providers and data providers may receive normal network metadata such as IP and request logs; this project does not promise zero third-party retention. External source links open their respective sites. Packaged photos are served with the app. No project analytics or advertising SDK is included.

To remove personal places: open 我的地点, delete entries or first export a backup then clear this site's browser storage in browser settings. Clearing site storage also removes wishlist/trip/profile. There is no server account to delete. Do not paste passport scans, keys or private notes into public GitHub Issues.
