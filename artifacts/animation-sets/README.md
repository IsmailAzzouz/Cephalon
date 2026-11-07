# Animation profiles — browser observation

`action-library.webm` visits ten behaviors at 390 × 844; corresponding images
allow pose inspection. Idle and report reuse states observed in `artifacts/presence/`.

`browser-review.json` records poses, correlated-event progression, speed-setting
persistence after reload and invalid-import rejection. The tool → subagent → speech
→ old-tool end → speech end → subagent end sequence correctly returns to the link
then idle. No browser error was reported.

`roundtrip-review.json` records fixture import, downloaded export, variant creation
and preview with editor closure. It also covers 320 × 640 framing, default pause
under reduced motion and two TTS sessions: ending the first preserves the second’s
level; ending the last clears it.

`exported-profile.v1.json` is the file actually downloaded from the editor.
`summon-desktop.png`, `summon-narrow.png` and editor views show inspected configurations.
These are browser workflows, not unit tests. Summon displays simulated contacts;
no external subagent is created.

Historical captures and exported values retain their original interface language.
