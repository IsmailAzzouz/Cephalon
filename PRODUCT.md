# Céphalon

## Product

An early draft of a resident desktop companion for an Operator. Ordis is the
current default profile. The name, wake phrase, voice, personality and visual
style are intended to be customizable; the profile system is not implemented.

Calling the chosen name (“Hey Ordis” for the default profile) or activating the
companion manually brings it above the current application. The Operator can
speak to it, assign work, request progress, interrupt it and hide it without
losing the task in progress.

## Two main agents

The conversation agent carries the selected personality and talks to the
Operator. The brain owns planning and execution. It delegates bounded missions
to specialists such as computer use, research or coding. Results return to the
brain; the conversation agent presents them and relays clarification requests.

## Presence

The companion host manages activation, audio streams, screens, visibility and
the runtime connection. Listening remains available while rendering is hidden
or suspended. Detecting activation does not depend on a model call. Visibility,
conversation, speech and tasks have independent lifecycles.

The Operator controls listening and can disable it. Microphone state and the
activation mode must be understandable in settings and in the companion’s presence.

## Visual identity

The default Ordis profile uses a holographic crystal inspired by the Warframe
character: a coherent volume, luminous core, horizontal waves and expression
without a face. Semantic events guide posture. Actual audio guides the waves;
volume never determines emotion. Respect reduced-motion preferences.

## Implementation status

Available: the Three.js / JavaScript avatar, controller, animation, v1 events,
browser audio analysis, visual playground, offline voice tooling and fictional
local mission. The playground uses Node.js 20+ and local resources. Demo voice
packs remain in the repository and export with provenance and explicit exclusions
from MIT. Model weights are excluded. These demo voices do not constrain future
companion profiles. The mission also runs without narration if its pack is absent.

To build: resident native application, voice activation, desktop overlay,
on-demand STT / TTS, agents and orchestration, tools and persistence. The desktop
shell, providers and first target graphical environment are still to be selected.
Support for other systems is not established.

Game recordings and generated dialogue retain distinct collections and provenance.
Mission data is explicitly fictional.
