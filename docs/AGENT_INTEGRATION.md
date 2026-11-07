# Connecting an agent to Céphalon

This page describes the existing visual v1 contract. The future companion
protocol is documented separately in [protocol.md](protocol.md).

Three.js rendering, the controller and agent events are separate. The future
host chooses the transport: JavaScript calls, WebSocket, SSE or IPC relay.
Céphalon depends on no agent SDK and does not execute received tools. Its adapter
animates their activity.

## Try and customize

On the page, **Animations → Animation profiles** provides twelve profiles:

| Identifier | Movement |
| --- | --- |
| `idle` | Calm presence and occasional glances |
| `read` | Scan lines, left page then right page |
| `write` | Short gestures toward a work area, written lines and proofreading pauses |
| `listen` | Face the Operator, attentive tilt and microphone response |
| `speak` | Face the Operator with phrase and audio-transient accents |
| `think` | Look away, pause and return attention |
| `search` | Faster reading and source scanning |
| `analyse` | Move closer, inspect and step back to think |
| `compare` | Alternate between two sources |
| `contact` | Face a contact, emit a link pulse and wait |
| `summon` | Call one or more subagents, double pulse and observe links |
| `report` | Return toward the Operator, move closer and present findings |

A profile combines behavior, audio state, lighting activity, attention direction
and motion settings. Transitions use the presence director’s damped springs.
Rings remain horizontal.

The editor adjusts speed, intensity, travel, tilt, approach, direction and preview
duration. Duplicate a profile, bind tool names and import/export v1 JSON. Settings
remain in browser local storage; integrating applications must import the file
on other devices themselves.

`pulse` controls physical cube pulsation and discharges; `radiance` controls the
associated energy emission. A shared score synchronizes body, surfaces, core,
waves and afterglow. Speech is expressed primarily through waves; only spaced
phrase accents create small crystal tensions. New parameters default to 1 when
missing from an older v1 configuration.

Direct preview: `http://localhost:5173/?animation=summon`.

## Action API

```js
// An action remains active until explicitly finished.
const read = cephalon.actions.start('read', { id: 'read-42', record: 'README.md' });
// ... the real tool reads the file ...
cephalon.actions.finish(read);

// A preview ends after the profile duration, or the supplied duration.
cephalon.actions.play('summon', { duration: 7, agentCount: 3 });
cephalon.actions.snapshot();
cephalon.actions.stopAll();
```

`start(name, options)` returns an identifier. `finish(id)` and `cancel(id)` affect
only that identifier. Repeated starts with the same identifier are ignored.
Identifiers are unique across all active actions. Finishing an unknown action
has no effect. `start` accepts an optional `duration`; without it, the action
never finishes automatically. `play` uses the profile’s duration.

Actions overlap by priority: speech/report 90, listening 80, contact/summon 60,
others 40. At equal priority, the newest controls posture. A finishing action
reveals the still-active action underneath: finishing an old tool therefore
does not cut off ongoing speech. `priority` overrides this choice from 0 to 100.
When all actions end, the controller restores its previous state. Action time
continues during interruption; global pause suspends their clocks.

`agentCount` controls one to four link points. Multiple active contact actions
also contribute to that count. These points represent presence; Céphalon does
not create real agents.

`cephalon.actions` preserves the selected audio source. The demo uses a simulated
signal. Volume never determines emotion.

## JSON v1 events

The entry point is `cephalon.events.handle(event)`. TypeScript definitions are in
[`packages/contracts/src/avatar-events.d.ts`](../packages/contracts/src/avatar-events.d.ts).

```js
const send = event => cephalon.events.handle({ version: 1, ...event });

send({ type: 'tool.start', id: 'read-42', tool: 'read_file' });
send({ type: 'subagent.start', id: 'researcher-1', agentCount: 2 });

// Speech takes priority over background work.
send({ type: 'speech.start', id: 'reply-1' });
send({ type: 'signals', signals: {
  outputVoiceLevel: 0.6,
  frequencyBands: [0.4, 0.7, 0.2]
}});
send({ type: 'tool.end', id: 'read-42' }); // speech continues
send({ type: 'speech.end', id: 'reply-1' }); // return to subagents
send({ type: 'subagent.end', id: 'researcher-1' });
```

| Event | Specific fields | Effect |
| --- | --- | --- |
| `action.start` | `id`, `animation` | Start a named profile, including a custom variant |
| `action.end` / `action.cancel` | `id` | Finish this action |
| `tool.start` | `id`, `tool` | Resolve a tool name through explicit bindings |
| `tool.end` / `tool.error` | `id` | Finish the tool; an error causes a small visual glitch |
| `subagent.start` | `id`, `agentCount?` | Start summon and maintain link presence |
| `subagent.end` / `subagent.error` | `id` | Finish this link |
| `speech.start` / `speech.end` | `id?` | TTS speech start/end |
| `listening.start` / `listening.end` | `id?` | STT listening start/end |
| `signals` | `signals` | Separate input/output RMS and frequency bands |
| `emotion` | `emotion`, `intensity?` | Explicit emotion from the conversation system |
| `reset` | — | Cancel visual actions and reset audio levels |

Start events also accept `focus: [x, y]`, `priority` and `agentCount`. Attention
coordinates are normalized from −1 to 1, positive right and up. Identifiers must
be unique across tools, subagents and speech. Without `id`, audio events use
`audio:output` and `audio:input`. Distinct identifiers for successive sessions
allow their late endings to be ignored.

Real events disable the simulated audio signal. A silent `speech.start` does not
invent voice activity. Supply audio levels or connect actual TTS output. Listening
motion uses a separate STT level. An audio ending clears its level when no other
action on the same channel remains active.

Events do not infer tool meaning from names: bindings are explicit. An unbound
tool uses `think`.

```js
cephalon.animations.bindTools({
  'filesystem.read': 'read',
  'filesystem.write': 'write',
  'web.search': 'search',
  'agents.spawn': 'summon',
  'agents.message': 'contact'
}); // replaces the entire table
```

Connect a transport supplied by the agent application:

```js
const stream = new EventSource(agentEventsURL);
stream.onmessage = message => {
  try { cephalon.events.handle(JSON.parse(message.data)); }
  catch (error) { console.error('Céphalon event rejected', error); }
};
stream.onerror = () => {
  // Clear stale visual presence according to the host’s reconnection policy.
  cephalon.events.handle({ version: 1, type: 'reset' });
};
// When closing the integration: stream.close();
```

The host handles authentication, allowed origins and reconnection for its own
transport. No WebSocket server or network endpoint is added here.

## Define and share a variant

```js
cephalon.animations.configure('review', {
  extends: 'read',
  label: 'Review a document',
  tempo: 0.7,
  intensity: 0.8,
  focus: [-0.55, 0.15],
  duration: 8
});
cephalon.animations.configure('summon', { tempo: 0.8, tilt: 0.65 });
const configuration = cephalon.animations.export();
// Save in the integrating application’s repository.
cephalon.animations.import(configuration);
```

Available behaviors remain the twelve native behaviors; a new name creates a
declarative variant of one of them. New choreography requires adding a behavior
to `ActionChoreography.js`. JSON never contains executable JavaScript.

| Parameter | Values |
| --- | --- |
| `tempo` | 0.25–2.5 |
| `intensity`, `travel`, `tilt`, `lean` | 0–2 |
| `pulse` | 0–2; 0 suppresses new physical pulses and discharges |
| `radiance` | 0–2; edge, core and energy-effect emission |
| `focus` | Two numbers between −1 and 1 |
| `duration` | 0.3–120 seconds, used by `play` |

Imports are validated before replacing the live library. An invalid file preserves
previous settings. `configure` changes one profile; `import` starts from supplied
profiles and applies configuration. `reset(name)` restores a native profile;
`reset()` restores the whole library and bindings. Short gestures from the
historical `cue` API and the mission remain available.

## Reuse the controller without the demo page

```js
import { AvatarAnimationController } from './packages/avatar/src/AvatarAnimationController.js';
import { AgentEventBridge } from './packages/avatar/src/AgentEventBridge.js';

const controller = new AvatarAnimationController({ demo: false });
const events = new AgentEventBridge(controller);
events.handle({ version: 1, type: 'tool.start', id: 'job-1', tool: 'read_file' });
// The host calls controller.update(deltaSeconds) from its loop.
```

`AnimationLibrary`, `ActionAnimations`, `ActionChoreography` and `AgentEventBridge`
import neither Three.js nor the DOM. `PresenceDirector` translates their intentions
into posture. `ContactLinks` and `AttentionField` provide spatial representations.

The avatar provides presence and audio analysis. STT recognition, TTS generation
and agent execution remain to be implemented in the companion and runtime.

To try actual audio without a TTS provider, twelve original English and twelve
French clips were generated offline using the supplied Ordis model. English is
the default. `await cephalon.playVoice('en:summon')` or
`cephalon.playVoice('fr:summon')` plays a local file and drives actual RMS/frequency
bands. The `official` collection contains four short game recordings with Wiki
provenance. `cephalon.playVoice('official:glitch')` plays the reference clip and its
synchronized reaction. Generated lines are not presented as official quotations.

`cephalon.voices.clips` describes the current collection;
`cephalon.voices.setCollection('en' | 'fr' | 'official')` changes it. Without a prefix,
`playVoice` searches the current collection then generated English clips. These
previews use speech state and interrupt the current demo. Their `animation` field
describes context. See [voice tooling](../tooling/voice/README.md); these files are
not an on-demand TTS engine and retain their explicit license exclusions.

`cephalon.startShowcase()` and `cephalon.stopShowcase()` present profiles without
the mission log. The showcase uses the same profiles as external events and a
simulated audio signal. Manual interaction or an external event interrupts it.
Pause suspends progression; reduced-motion preferences remain respected.

The investigation mission uses dedicated English narration via `MissionNarration.js`.
A start-button press unlocks Web Audio. Clips are decoded to buffers so phases
continue without another gesture. Pause resumes at the same offset; stop also
cancels pending playback. `controller.setSpeechActive(true)` enables TTS reactivity
while preserving a work state such as `thinking`. The mission disables it after
each line. Actual audio remains separate from the microphone and never determines
emotion. `cephalon.missionNarration` exposes the demo player, not an on-demand
TTS service. Without a voice pack, the mission runs without narration.
