# Verification — November 7, 2026 reconstruction

This is the translated record of historical construction passes. Paths and
service references describe those passes; they are not new verification claims.
Historical screenshots and raw observations retain their original language.

At the time of the pass, `cephalon-preview.service` kept the server running with
`npm run dev -- --host 0.0.0.0 --log-requests`; the preview used port 5173.

## Automated tests

The preceding pass validated **34 tests**. Coverage included PCM RMS, frequency
bands at multiple sample rates, microphone/output separation, audio cancellation,
STT-track ownership, attack/release times, states/emotions, glitch recovery,
absence of permanent fragmentation, motion/zoom, closed hexahedron geometry,
three horizontal wave layers, file serving and the demo mission. The suite was
not rerun during the gesture pass and no unit tests were added, as requested.

The crystal has eight shared corners, twelve edges and six faces. Each triangulated
edge has two neighbors. Normals and positions are finite. Waves are not attached
to the crystal’s tilt rig.

## Browser

Chromium with software WebGL was checked at 390 × 844, 320 × 640, 844 × 390,
1440 × 900 and with reduced motion. No JavaScript/shader error or horizontal
overflow was detected. The render target was actually HalfFloat and HDR support
was confirmed.

The workflow checked states, touch/rotation, horizontality after rotation,
full glitch recovery, emotions, optical sliders, disabled post-effects, layer
isolation, reset, pause, immersion and keyboard controls.

A multiband WAV played through Web Audio produced nonzero output/bands while
microphone level stayed zero and simulation was disabled. A Chromium test
microphone on localhost supplied separate input without invented TTS levels.
Editor-owned microphone tracks stopped correctly; external streams remained
owned by their callers.

Details are in the root `artifacts/rebuild/browser-checks.json`. Construction,
mobile and desktop images were inspected. Glass overexposure during glitch was
corrected by bounding optical distance and keeping glass below the bloom
extraction threshold. Strong emission belongs to edges, waves and core.

## Agent demo mission

The 29.6-second sequence was checked end to end in Chromium with touch emulation:
automatic launch, actual clock pause, progressive search, result-derived report,
evidence log, replay and cancellation. Sizes 320 × 640, 844 × 390 and 1440 × 900,
plus reduced motion, were also checked without reported JavaScript errors.
Results are in `artifacts/mission/checks.json` at the root.

The scenario examines 12 fictional transmissions, cross-checks TR-004/TR-008 and
analyzes 200 packets. The +34% power peak and 98% integrity are computed then
incorporated into the report. An unsuccessful-search test checks that discoveries
and conclusions are not invented. Tests also cover duplicate evidence, pause,
stop, replay and separation between task, speech and emotion.

## Presence and gesture pass

The entire mission was recorded in Chromium at 390 × 844 with nine pose captures
and no reported JavaScript/shader errors. Left/right reading and report images
were visually inspected: body orientation changes clearly, faces reveal different
depths and rings retain a horizontal ellipse.

Recorded lateral orientation ranged from −32.5° to +32.2°, vertical tilt from
−16.1° to +13.4°, with approach up to 0.23 units. These measurements document
executed motion; artistic assessment relies on rendered views. Search follows
actual records, comparison alternates sources and speech returns to the Operator.
Manual rotation retains temporary priority.

Video: `artifacts/presence/ordis-live.webm`. Poses and measurements:
`artifacts/presence/`. Module syntax and static export were checked; no unit tests
were run for this pass.

Reading was also inspected at 1440 × 900 (`10-desktop-reading.png`) without
JavaScript errors or horizontal overflow. Pause preserved the exact pose during
observation. The service was active and its LAN endpoint returned HTTP 200.

## Profile library and agent events

Twelve declarative profiles, choreography and tool bindings were added. Browser
checks observed ten profiles at 390 × 844 and inspected writing, summon, mobile
and desktop editors, and narrow 320 × 640 framing. Desktop views were 1440 × 900.
Rings retained horizontal rotation through posture changes. Contact demonstrations
created no real subagents.

The correlated-event lifecycle ran in the page: reading tool starts, subagent call
takes priority, speech interrupts; ending the old tool preserves speech; ending
speech restores the link; ending the subagent restores idle. Ending an old TTS
session preserved another active session’s level; ending the last cleared it.

Editor controls imported the fixture, downloaded actual JSON, created a variant
and previewed it with the panel closed. A speed setting persisted after reload.
Invalid import was rejected without changing the library. Reduced motion froze
posture by default. No browser errors were reported. Logs, captures and video:
`artifacts/animation-sets/`.

New modules passed syntax and static-export checks. No unit tests were added or
run in this pass. External transport and real STT/TTS services were not connected;
see the integration contract and examples in `docs/AGENT_INTEGRATION.md`.

## Crystal resonance and pulsation

A complete 23-second showcase was recorded at 390 × 844 and reached completion
without reported JavaScript/shader errors. Recorded cube scaling contracted to
0.921 and expanded to 1.066; the desktop discharge inspection reached 1.085.
These factors apply to the cube, not rings.

Charge, discharge and afterglow were inspected, including summon at 1440 × 900.
Volume remained coherent, outer wavefronts horizontal, core light concentrated
then released, and afterglow faded. Pause froze the energy score. `pulse` and
`radiance` were available in the editor. Older v1 JSON imported both at 1;
`pulse: 0` restored neutral volume scale after preceding effects faded.

Video and logs: `artifacts/resonance/energy-showcase.webm`, `showcase-review.json`
and `controls-review.json`. Numbered images are intermediate material studies;
`*-live.png` and `summon-desktop.png` show the final amplitude setting. Syntax
and static export were checked. No unit tests were added or run.

## Ordis clips using the supplied model

The supplied `ordis_robotic_voice_warframe_13875.zip` was originally extracted
under `voice/models/ordis/`. Checkpoint/index hashes were recorded in the original
`voice/model-provenance.json`. The checkpoint reported RVC v2, 40 kHz, F0 enabled
and 1000 epochs. The isolated CPU pipeline used Piper for French source speech,
then the model and index to convert twelve lines. Current paths live under
`tooling/voice/`.

The generated pack contained twelve WAVs and twelve MP3s, totaling 47.48 seconds.
WAV values were finite, nonzero and peaked below 1. MP3s were decoded to inspect
metadata and levels. The original `public/audio/ordis/manifest.json` recorded
text, duration, conversion parameters and hashes. The delivery ZIP included clips
and metadata without model weights.

Chromium at 390 × 844 loaded twelve choices, downloaded the summon MP3 and showed
actual playback. Voice level reached 0.939; microphone stayed zero. Simulation
was disabled, the panel closed and waves followed output. Stop removed the media
element/analyzer, restored idle and cleared the signal. A WAV loaded via the file
picker still played after the player change. Views at 390 × 844 and 320 × 640
were inspected. No JavaScript error was reported.

Automatic transcription of three clips recognized much of the content with word
errors. Piper source also produced some of those errors in the same transcriber.
This is indicative, neither human listening nor a validation of resemblance to
Ordis. The user still needs to judge by listening. Results: `artifacts/voice/`.

The static export contained playback clips only; Python/models stayed local.
The server was restarted to serve `/audio/` with correct MIME types. No unit
tests were added or run.

## English and game references

The WARFRAME Wiki Ordis/Quotes page was consulted. Four short recordings were
retrieved through its audio links, including the supplied `DIdle080Ordis_en.ogg`
reference available on the wiki. OGGs and MP3 conversions total 11.66 seconds.
The manifest records source, original filename, duration, SHA-256 and Digital
Extremes / Warframe credit.

Twelve original action scripts were generated in English using Piper Ryan high,
the same Ordis RVC v2 model and index: 34.7 seconds in WAV/MP3 without overwriting
French. The English ZIP contains only these creations and provenance; game
recordings remain a separate catalog. Indicative automatic transcripts of three
English lines retain their errors without claiming human listening or verified likeness.

The browser workflow confirmed English by default and collections of 12 English,
4 game and 12 French clips. English playback activated actual RMS (0.664 observed),
disabled simulation and kept the microphone zero. The reference clip’s reaction
fired around 1.2 seconds, an approximate automatic-alignment marker. It fired
once and was observed in rendering. Under reduced motion, audio remained playable
and glitch stayed zero. Stop ended playback and restored idle. French remained
accessible by explicit identifier. No browser errors were reported.

Game-collection views were inspected at 390 × 844 and 320 × 640. Source links were
visible in the editor. Results: `artifacts/voice/english-browser-review.json`,
`english-transcription.json` and `official-cue-timing.json`. No unit tests were
added or run.

## English narrated mission

Ten original dedicated clips were generated with the supplied Ordis model:
seven mission lines and three cautious fallbacks. The main report lasts 14.1
seconds and states Relay E-17, Europa, +34% and 98%. Phase durations follow decoded
buffers; an end-of-playback barrier prevents transitions from cutting a line.
Specific announcements are selected only for matching results.

The complete 390 × 844 workflow observed seven phases/clips through completed
report without JavaScript errors. Before Start, there was no audio context or
active output. One press unlocked preload, decoding and the entire mission.
Actual voice level reached 0.857 in this recording; microphone remained zero to
numerical precision. Work movement and speech activation are separate, allowing
search to speak while reading. Report and messages were English.

Pausing during search preserved the mission clock and audio position exactly,
then resumed to completion. Replay followed by stop cut output, speech activation
and narration waits. At 320 × 640 with reduced motion, audio played while the cube
stayed at neutral scale and microphone zero. No source selected `not-found`.
Changed data selected `report-generic` without reciting scenario measurements.
Stopping during preparation did not trigger a late start.

Results: `artifacts/voiced-mission/browser-review.json`, `edge-review.json` and
ready/search/report/small-screen captures. `mission-visual.webm` is browser video
without audio; actual sound was checked through Web Audio analyzers and logs.
Syntax and static build passed. The LAN service was active, HTTP 200. No unit
tests were added or run.

## Specific limitations

Four reference images and a comparison image mentioned in the request were not
attached. Reconstruction followed the brief and an accessible official GIF,
without claiming comparisons against absent images.

Touch checks used browser emulation. A physical phone and Safari still require
user review. Microphone access on LAN HTTP is unavailable; HTTPS or localhost is
required. The editor explains this; audio files and external signals work over HTTP.

The project prepares TTS/STT integration and audio analysis. Delivered clips have
an offline generator; the site has neither speech recognition nor on-demand TTS.

Historical service commands: `systemctl --user status cephalon-preview.service`
and `journalctl --user -u cephalon-preview.service`. No service is installed by
current repository setup.
