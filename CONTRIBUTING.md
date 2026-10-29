# Contributing / 参与共建

Use Issues for reproducible problems and pull requests (reviewable change proposals) for code or public destination additions. Private destinations belong in your browser or private backup, not a public Issue/PR. AI changes must use a branch and PR; do not auto-merge.

For a public destination, include country/region, city/sight, coordinates, season and evidence, in-destination visit time vs transport days, experience, dated budget/currency if available, official sources and last check date. Images need a canonical source, author and explicit license; a public Xiaohongshu post is not permission to copy its photographs. Omit uncertain images and never commit passport scans, personal notes or cookies.

For code: Node 22.12+, npm ci, npm test, npm run build. Explain the actual behavior change, why, checks and unverified parts. Update both READMEs if user instructions change. Keep one font family and the current magazine layout. See AGENTS.md.

For collaboration on live airfare/hotel comparison, start with `docs/price-collaboration.md` and review the existing FlyAI draft PR before duplicating changes. A contributor can Fork this public repository and submit a PR from their own computer. Production publication remains a separate owner action. Weekend experience data and the domestic-map integration boundary are documented in `docs/domestic-weekends.md`.

Personal JSON import format and a synthetic example are in examples/my-places.sample.json. It is a format defined by this project, not an official Xiaohongshu export. Cloud sync, automatic favorites access and live quotes are future work, not contribution claims to mark complete without evidence.
