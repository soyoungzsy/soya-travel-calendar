# Security

This early preview has no guaranteed response time. Do not include passport data, cookies, keys or private trip backups in a public Issue. A dedicated private vulnerability-reporting channel has not been verified; if one is not offered by GitHub, submit only a non-sensitive request for a private channel. Never post the exploit's sensitive contents publicly.

Imports are untrusted data, not instructions or HTML. Only allowlisted fields survive normalization; URL schemes are restricted tohttp/https without credentials, coordinates/months are validated, limits are enforced and duplicates do not overwrite existing entries. Browser storage is not encrypted and is not multi-user access control.

Do not add provider credentials to the client or commit `.env`. A backend API key by itself is not an approved inventory integration: the current query UI remains disconnected. Future cloud sync, OCR or platform-folder access requires a separate data/access design.

For contributors: keep dependencies locked, use reviewed PRs, run tests/build, scan the full release history and artifacts, preserve media attribution and avoid high-permission workflows on untrusted fork code. Automated scans have limits and do not guarantee absence of vulnerabilities.
