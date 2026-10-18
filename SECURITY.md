# Security

This early preview has no guaranteed response time. Do not include passport data, cookies, keys or private trip backups in a public Issue. A dedicated private vulnerability-reporting channel has not been verified; if one is not offered by GitHub, submit only a non-sensitive request for a private channel. Never post the exploit's sensitive contents publicly.

Imports are untrusted data, not instructions or HTML. Only allowlisted fields survive normalization; URL schemes are restricted tohttp/https without credentials, coordinates/months are validated, limits are enforced and duplicates do not overwrite existing entries. Browser storage is not encrypted and is not multi-user access control.

Document OCR runs locally, uses same-origin assets and an explicit field-review step. Treat photos and OCR output as untrusted data. Never add raw text logging, remote image uploads, real-document test fixtures, analytics on document fields or a CDN fallback. Only allowlisted travel fields may enter the profile; MRZ checksum validation is an OCR check, not identity/authenticity verification. A compromised browser, malicious extension or compromised copy of the website can still access selected photos and browser storage. This app is not a secure document vault.

Do not add provider credentials to the client or commit `.env`. A backend API key by itself is not an approved inventory integration: the current query UI remains disconnected. Future cloud sync, remote OCR or platform-folder access requires a separate data/access design and explicit authorization.

For contributors: keep dependencies locked, use reviewed PRs, run tests/build, scan the full release history and artifacts, preserve media attribution and avoid high-permission workflows on untrusted fork code. Automated scans have limits and do not guarantee absence of vulnerabilities.
