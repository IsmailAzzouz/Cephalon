# Ordis avatar playground

Three.js avatar: a coherent holographic crystal, horizontal waves, stylized
volumetric core, HDR bloom and expression without a face.

This guide describes the existing browser playground. See the [main README](../README.md)
for the target product. Real agents and the resident companion remain to be built.
Ordis is the draft’s default profile, not the project’s required identity.

## Run on a local network

Node.js 20+ is sufficient. Three.js and fonts are included.

```bash
cd Cephalon
npm run dev -- --host 0.0.0.0
```

On this computer, open **http://localhost:5173/**. On a phone on the same network,
use the local address printed by the server. No system service is installed
automatically; keep the terminal open for the preview. Avoid a second instance
on the same port. To choose another: `npm run dev -- --host 0.0.0.0 --port 5174`.

## Optional local voices

Demo voices and game excerpts are included with attribution and license exclusions.
They are not MIT-licensed. Model weights are not included. The mission also runs
without narration when its pack is absent.

## Agent demo mission

Open **http://localhost:5173/?mission=1**, then press **Start mission**. This gesture
unlocks audio in a phone browser; no track starts automatically on page load.

In about 40 seconds, Ordis receives an Operator request, prepares a plan, searches
transmissions, locates a source, analyzes its packets, cross-checks observations
and presents a report. The mission text and narration are English only. Ordis
acknowledges with a tilt, looks away to think, scans left to right and top to
bottom, approaches the result, compares two sources and returns to the Operator.
Posture accents accompany phrases.

Each phase has a dedicated line generated using the supplied Ordis model. Waves
and core follow actual audio while work gestures remain active. The report names
the source and computed scenario values. Phases wait for their lines to finish;
silences leave room for work between remarks.

The scenario uses **12 fictional local transmissions**, labeled in the interface.
Frequency/signature filtering, packet aggregation, measurements and verification
execute in the browser. The report derives from results, not web search or a
remote model. No recommendation is executed on the computer or network.

The mission provides a log, pause, stop, resume and replay. Pause freezes voice
at its current offset, then resumes; stop also cuts audio. Hiding the tab pauses
the mission. Manual state or source changes interrupt it. Tapping the crystal
returns it to listening; dragging only changes orientation.

```js
cephalon.startMission();
cephalon.mission.setPaused(true);
cephalon.mission.setPaused(false);
cephalon.mission.snapshot();
cephalon.stopMission();
```

Scenario and data live in `examples/signal-mission/src/SignalScenario.js`.
`AgentSequence.js` is independent of rendering and the DOM; its view adapts to
phone and desktop. `MissionNarration.js` manages buffers, pause and resume.
Specific numeric announcements are reserved for matching results. Other searches
receive cautious fallback lines without invented scenario data. Voiced-mission
captures and checks are in `artifacts/voiced-mission/`.

## Explore

**Animations** opens twelve profiles: idle, read, write, listen, speak, think,
search, analyze, compare, contact, summon and report. **Play profile** closes the
editor so the movement is visible. Adjust, duplicate and export profiles as JSON,
and bind tool names in the same editor. Settings are stored on this device.

**Play sequence**, or **http://localhost:5173/?showcase=1**, presents an approximately
23-second visual sequence: listening, thinking, writing, summoning, analysis and
report. No mission text covers the projection. The voice signal is simulated;
no generated sound is played.

The cube breathes and contracts with each action. A shared energy score synchronizes
deformation, fractures, core, face caustics, edge afterglow and horizontal discharge
waves. Summon concentrates energy before two discharges; links show moving packets.
**Crystal pulsation** and **Energy radiance** are independent profile settings.
Older v1 JSON files remain importable.

The integration layer receives JSON v1 events without an agent framework. It
tracks tool starts/ends, speech, listening and subagents, with correlated identifiers
and resumption of underlying actions after interruption. See
[AGENT_INTEGRATION.md](AGENT_INTEGRATION.md) for contract, examples and limitations.

```js
const action = cephalon.actions.start('write', { id: 'edit-42' });
// When the real tool finishes:
cephalon.actions.finish(action);
cephalon.events.handle({ version: 1, type: 'subagent.start', id: 'researcher-1' });
cephalon.events.handle({ version: 1, type: 'subagent.end', id: 'researcher-1' });
```

Idle, Listening, Thinking and Speaking use a labeled **simulated audio signal**
by default. Choose emotion in the optical settings. The lightning icon triggers
a short glitch.

Drag to rotate; pinch or scroll to zoom; double tap/click or Home to recenter.
Waves stay horizontal as the crystal rotates. Space toggles idle/speaking; arrow
keys change orientation. Escape closes the editor or leaves immersion.

The settings icon or **http://localhost:5173/?debug** opens material, Fresnel,
edges, bloom, dispersion, core, waves and reactions. Isolate layers, disable
post-processing and inspect seven reconstruction stages.

## Actual audio

English is the default voice collection: twelve original lines generated with
the supplied RVC model. The editor separates generated English/French collections
from four short game recordings sourced from the WARFRAME Wiki. Created dialogue
is not presented as official quotations.

Open **http://localhost:5173/?voice=en** for generated lines or
**http://localhost:5173/?voice=official** for game excerpts, including the supplied
personality-glitch reference. Choose a line and **Play with avatar**. Waves follow
actual audio; a brief glitch follows the reference clip’s relevant passage. French
remains available in the collection selector. MP3 downloads and game-source links
are provided.

The [English WAV/MP3 pack](http://localhost:5173/audio/ordis-en/ordis-en-pack.zip),
[French pack](http://localhost:5173/audio/ordis/ordis-fr-pack.zip) and regeneration
instructions are described in [voice tooling](../tooling/voice/README.md).

Load a local MP3, WAV or another browser-supported file in the editor. Playback
and analysis occur on the device; the file is not uploaded. RMS and three
frequency bands drive speech with 50 ms attack and 170 ms release.

The microphone uses separate analysis and is never connected to speakers. Access
requires **HTTPS or localhost**. On a LAN HTTP address, its control is disabled
with an explanation; files and application-supplied levels remain usable.

The project prepares TTS/STT events. Included clips are generated offline through
`tooling/voice/generate.py`; the site has no speech recognition or on-demand TTS service.

## Conversation-system API

The rendering-independent controller is in `packages/avatar/src/AvatarAnimationController.js`.
The demo exposes `window.cephalon`:

```js
cephalon.setState('speaking');
cephalon.setEmotion('happy', 0.8);
cephalon.setSignals({
  outputVoiceLevel: 0.6,
  inputMicLevel: 0,
  frequencyBands: [0.4, 0.65, 0.2], // bass, mids, treble
});

// Listening uses a separate microphone signal.
cephalon.setState('listening');
cephalon.setSignals({
  inputMicLevel: 0.35,
  inputFrequencyBands: [0.2, 0.3, 0.1],
  outputVoiceLevel: 0
});
cephalon.triggerGlitch(0.8, 0.26);
cephalon.useDemo();
```

Gestures may follow external agent events. `focus` is a normalized attention
direction, positive X right and positive Y up. Rotation and travel are damped;
the core slightly leads the body.

```js
cephalon.setState('thinking');
cephalon.cue('tool-call', {focus: [-0.7, 0.25], duration: 0.5, tool: 'Search'});
// When data arrives:
cephalon.cue('read', {focus: [-0.6, -0.1], duration: 0.6, record: 'source-004'});
// To compare results:
cephalon.cue('compare', {duration: 3});
// At the start of a report:
cephalon.setState('speaking');
cephalon.cue('report', {duration: 2});
```

Available gestures: `acknowledge, consider, tool-call, read, inspect, compare,
found, report, settle`. A gesture changes neither state nor emotion. Data
projections remain secondary and disappear when the avatar returns to address
the Operator. Manual dragging temporarily takes priority over autonomous movement.

States: `idle, listening, thinking, speaking, glitch`. Emotions: `neutral, happy,
curious, concerned, sad, angry, surprised`. Levels and intensities are normalized
between 0 and 1. Volume never determines emotion.

Properties `state, emotion, emotionIntensity, outputVoiceLevel, inputMicLevel,
frequencyBands, glitchIntensity` are exposed; `time` is readable. `setSignals`
disables simulation. Optical parameters are accessible through `cephalon.config`.

To analyze Web Audio output already playing:

```js
await cephalon.connectOutput(ttsGainNode); // analysis only, without doubling sound
// audible:true also routes the analyzer to the destination if needed.
await cephalon.connectMicrophone(sttMediaStream);
```

A caller-supplied microphone stream remains its property. `stopAudio()` disconnects
analysis without stopping STT tracks. A microphone requested by the editor is
stopped when its capture closes.

## Architecture

`packages/avatar/src/` contains composition, controller, interaction, crystal,
fractures, core, filaments, three wave layers and the optical pipeline. Position
and crystal-orientation rigs are separate.

`PresenceDirector.js` maps semantic states/gestures to attention and damped posture.
`AttentionField.js` displays small work projections. Rendering does not depend on
log text. The recorded sequence and poses are in `artifacts/presence/`.

`AnimationLibrary.js` holds declarative profiles and tool bindings.
`ActionAnimations.js` tracks their lifecycle; `ActionChoreography.js` defines
behavior; `AgentEventBridge.js` maps external events. These modules import neither
DOM nor Three.js. Types live in `packages/contracts/src/avatar-events.d.ts`.
`ContactLinks.js` shows temporary link points; it creates no real subagents.

`EnergyDynamics.js` generates pulses and damped deformation. `CrystalResonance.js`
draws caustics and coherent volume echoes. `EnergyWake.js` renders XZ wavefronts
and ion trails. The ring rig stays separate from cube deformation.

Bloom uses a HalfFloat target, emissive extraction and three blur levels.
Dispersion affects highlights. The editor reports fallback rendering when HDR
is unavailable.

## Verify and export

```bash
npm test
npm run build
npm run preview -- --host 0.0.0.0
```

`dist/` is a standalone static HTTP export. Construction stages and browser
captures are in `artifacts/rebuild/`. `/src/review.html?stage=1` through `stage=7`
show the stages.

Reduced-motion preferences pause default movement and suppress jolts/flashes.
Pause freezes autonomous motion; signals and state changes remain available.
Rendering suspends while the tab is hidden.

## References and licenses

Four priority reference images and a comparison image mentioned in the original
brief were not attached. Reconstruction followed that brief and the GIF from
[the official Ordis post](https://forums.warframe.com/topic/1202015-cephalon-joke-a-thon-contest-winners-announced/),
inspected during development. A previously identified video compilation was not viewed.

Original geometry, a fan study, with no extracted game model. Three.js **r182**
uses MIT in `packages/avatar/vendor/three/LICENSE`. Barlow/Barlow Condensed use
OFL in `examples/avatar-playground/public/fonts/OFL.txt`. See the root
[third-party notices](../THIRD_PARTY_NOTICES.md) for media exclusions.
