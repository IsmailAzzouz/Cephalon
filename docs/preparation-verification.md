# Repository preparation verification

Checks performed on November 7, 2026, after the initial reorganization. This is
an historical report of that pass, not a claim about later verification runs.

## Successful checks

- `npm install --offline --ignore-scripts`: three local workspaces linked without
  downloading dependencies; lockfile added.
- `npm test`: five test files passed, containing 34 cases.
- `npm run build`: static playground exported to `dist/`.
- Module linking with Node’s ESM loader: all 34 playground modules and the review
  entry resolve in development and the export. This links modules without running WebGL.
- HTTP resource resolution: fonts and 38 clips from four catalogs available in
  development and the export.
- All 125 exported files matched development-server responses. No host, agent,
  tooling or voice-model directory was exported.
- Voice-generator inputs: English, French and mission scripts readable; Piper
  models resolved at their new locations. Local RVC links were updated after the move.
- The 22 modules retained in the avatar core and the v1 contract matched the
  previous sources. Other moves covered editors, scenario, bridge and entry points.
- Current documentation’s local links checked.

## Existing tests brought into alignment

Before reorganization, three mission tests expected French labels even though
the delivered scenario was English. Assertions now follow English labels while
preserving result and uncertainty checks.

The fragment test used defaults that disable fragments. It now explicitly enables
the layer and intensity to check appearance and return to rest. Rendering was unchanged.

## Limitations of that pass

Chromium could not start because a required system operation was forbidden.
No new visual review, actual audio playback or complete browser workflow was
claimed during this pass. Images in `artifacts/` came from historical checks.

The voice generator’s CLI help, inputs and paths were checked. Speech synthesis
and voice conversion were not rerun.

The resident companion, wake phrase, agents and native overlay remain to be
implemented. Current commands exercise the browser playground.
