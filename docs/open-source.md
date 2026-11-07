# Open-source preparation

Céphalon is an early draft. Ordis is its default profile. Name, wake phrase,
voice and style are intended to be customizable. The neutral role lives in
`agents/companion/`; proposed profiles live in `presets/`. Their format and
selection remain to be implemented.

## License and media

Original code and documentation are MIT-licensed, as chosen by the maintainer.
Included libraries retain their own licenses.

Generated voices, game recordings and voice archives remain in the repository
and export with attribution and explicit exclusions from MIT. Their inclusion
and attribution do not grant reuse permission. Sources and scope are documented
in the root `THIRD_PARTY_NOTICES.md` and each collection’s notices. Models and
local environments remain outside version control and the export. No Git
history has been rewritten.

## Contributions

English is the working language for documentation, repository instructions,
interface copy and diagnostics. Original dialogue and transcription data retain
their media language. Setup commands no longer depend on a personal path or a
preinstalled system service.

`CONTRIBUTING.md`, `SECURITY.md`, issue forms and the pull-request template
explain how to participate. GitHub Actions prepares tests and builds on Node.js
20, 22 and 24. Remote execution requires publishing the changes; this local
preparation does not claim a successful remote CI run.

## Local validation

Tests also cover an absent voice pack: the mission can run without narration,
while a loading error is reported. Included media remain usable in the playground
and export.

After `npm run build`, `node scripts/check-export.mjs` checks essential files,
licenses, all four voice collections’ notices, files referenced by their catalogs
and the absence of model weights.
