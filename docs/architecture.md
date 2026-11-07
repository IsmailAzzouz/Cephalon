# Target architecture

## Profiles and roles

Céphalon is the project. Ordis is the draft’s default profile, with its current
name, voice and visual style. The future profile system must allow those to
change without changing the conversation role, brain or specialists.
`agents/companion/` describes the role; `presets/` describes the proposed profiles.
The format, storage and profile selection remain to be implemented.

## Processes and responsibilities

The companion is the product’s entry point. Its host remains active while the
overlay is hidden. It detects activation, shows the companion, owns the microphone
and playback, and exchanges messages with the runtime. The overlay displays the
avatar, conversation and activity useful to the Operator.

The runtime hosts the conversation agent, brain and specialists. The application
assembles roles, integrations and tools. Shared lifecycle and delegation
mechanisms will live in `packages/agent-runtime/`.

```text
Operator
   ↕ activation, speech, input
Companion host ↔ Overlay → Avatar
   ↕ messages and events
Runtime: Conversation agent ↔ Brain ↔ Specialists
                                          ↕
                                        Tools
```

The runtime also publishes activity for display. This channel does not require
the conversation agent to narrate every tool start and finish. The avatar adapter
translates activity into animation. Agents do not control Three.js coordinates
and have no knowledge of native windows.

## Boundaries

- `apps/companion/host/`: activation, audio, presence, interactive session and connection.
- `apps/companion/overlay/`: rendering and visible interactions, without direct system control.
- `apps/companion/settings/`: companion configuration and Operator choices.
- `apps/runtime/`: startup, agent sessions and task tracking.
- `agents/`: behavior, instructions and logic specific to each role.
- `packages/avatar/`: reusable visual representation and signal analysis.
- `packages/contracts/`: exchange structures independent of an agent SDK or renderer.
- `packages/tools/`: operations invoked by agents. A tool performs an operation;
  a specialist conducts a mission using tools.
- `packages/integrations/`: model, STT, TTS and external-service adapters.
- `platform/`: implementations specific to an OS or graphical environment.

The host owns desktop microphone capture and voice playback. The avatar may
analyze levels or an output stream for animation; it does not own wake-word
listening. Rendering may be suspended without stopping activation.

## Separate lifecycles

| Domain | Example target states |
| --- | --- |
| Activation | disabled, listening for activation, detected |
| Presence | hidden, visible |
| Conversation | idle, listening, responding |
| Voice output | silent, playing, interrupted |
| Task | queued, running, waiting for information, complete, cancelled, failed |

Hiding the companion changes its presence. Stopping speech interrupts voice
output. Cancelling a task is an explicit intention sent to the brain and child
work. These actions must not trigger one another by default.

Reactivation rejoins the known session and tasks. Reconnection must recover a
current snapshot; replaying start events alone is insufficient. Runtime
unavailability must be represented without confusing a disconnected client
with a completed task.

## Dependencies and implementation

Applications may assemble packages and adapters; packages must not depend on
applications or examples. The avatar imports no agent code. Specialists do not
freely spawn chains of one another: the brain remains responsible for the plan
and its delegations.

The companion and runtime directories define future responsibilities. Process
layout, IPC, transport, persistence and the native shell will be documented
before implementation. This organization does not require microservices or a
process per agent. Computer-use isolation can be added when needed.

## Preserved implementation

The server and build expose only the paths declared in `scripts/layout.mjs`.
Demo media remain in the build with license exclusions and attribution, alongside
the project license and dependency notices. The playground reuses avatar and
fictional-scenario sources without duplication. Three.js and its license are
local to `packages/avatar/vendor/`. The voice library, animation editor and
optical controls belong to the browser example rather than the rendering core.

Voice models and intermediate files remain in `tooling/voice/`, outside Git and
the export. The existing `.venv-voice/` environment stays at the root to preserve
its installed executable paths.
