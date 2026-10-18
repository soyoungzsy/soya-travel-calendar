# Development and deployment / 给开发者

Ordinary users can skip this file. Node 22.12+ is required. Use npm ci, npm test and npm run build. npm run dev binds to127.0.0.1. The public repository contains no author's Sites project ID; configure your own hosting identity if using Sites. For plain static hosting, publish dist/client at the site root. The app works with dated fallback data when reference APIs are absent; the optional Worker in worker/index.js serves static assets and /api/fx, /api/interest and the disconnected travel-search status endpoint. Do not put server keys in frontend variables.

The build produces dist/client and dist/server plus a generic hosting manifest. No account creation, storage binding, domain registration or deployment is automatic. Self-hosting costs and access from different networks depend on your provider. A custom domain alone does not guarantee availability in mainland China.

Original curated data lives in src/data.mjs and src/discoveries.json; rich guides in src/travel-guides.json; image credit metadata in src/media.json. Personal records use a separate versioned local key and never change the curated dataset. Their months are user notes, not verified recommendation windows. Map-only private entries have no auto-priced itinerary.

Upgrade: export personal places first; install a fixed new release; retain the same browser origin if you want existing site storage, or import your backup on a different origin. File-mode storage differs between browsers, so keep a JSON backup. Roll back shared source with a revert commit or a previous release; do not rewrite published tags. Code rollback does not restore deleted browser data. Restore lists by importing your backup; duplicate records are skipped and existing notes retained.
