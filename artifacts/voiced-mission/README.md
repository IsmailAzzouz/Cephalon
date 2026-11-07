# Mission with English narration

The mission uses seven dedicated lines, including a 14.1-second report based on
expected scenario results. Three fallback clips avoid claiming those results when
data differs. Clips are in `examples/avatar-playground/public/audio/ordis-mission/`;
the script is `tooling/voice/mission.en.json` at the repository root.

`browser-review.json` records the full Chromium mission at 390 × 844: one start
press, seven phases/clips, actual RMS, pause/resume at the same offset, report
completion, replay and stop. `edge-review.json` covers a small screen under reduced
motion, no source, changed results and cancellation during preparation. No
JavaScript error was reported.

Images show the inspected rendering. `mission-visual.webm` captures browser video
without an audio track; actual voice checks use Web Audio levels, offsets and
generated files. No unit test was added or run in this pass. Physical-phone and
Safari checks remain for user review.

Listen at http://localhost:5173/?mission=1 then **Start mission**. Page load alone
does not start audio. Historical captures retain the original interface language.
