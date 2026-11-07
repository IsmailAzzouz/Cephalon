# Exchanges between components

## Available contract

`packages/contracts/src/avatar-events.d.ts` preserves the avatar JSON v1 contract.
`packages/avatar/src/AgentEventBridge.js` applies it to the controller. It covers
visual actions, tools, subagents, speech/listening states, emotions and audio
levels. The integration reference is `AGENT_INTEGRATION.md`.

This contract remains usable and was not changed by the reorganization. Its
identifiers correlate visual actions, not yet persistent sessions or tasks.
`reset` resets the avatar; it does not cancel real work.

## Future companion protocol

The format and transport remain to be defined. The families below are design
requirements, not messages already accepted by the v1 bridge.

| Domain | Exchanges to provide | State owner |
| --- | --- | --- |
| Activation | wake phrase, shortcut, manual command | Companion host |
| Presence | show, hide, place | Companion host |
| Conversation | request, clarification, response, interruption | Conversation session |
| Audio | speech start/end, interruption, levels | Host and voice adapters |
| Work | submit, progress, request information, cancel, finish | Brain in the runtime |
| Delegation | create a child mission, receive a result or blocker | Brain and specialist |
| Connection | connection state and recovery of a current snapshot | Host and runtime |

Future messages need a version, an identifier and the references required for
correlation: session, task, parent task or spoken reply. Commands express intent;
events describe actual changes. Repeated commands, late events and reconnections
must be handled explicitly.

The runtime emits semantic states. An adapter maps them to avatar v1 events;
a task must not depend on an animation’s duration. Frequent audio levels remain
separate from the task activity log.

Hiding the companion, interrupting speech and cancelling a task require distinct
commands. The work owner confirms cancellation; closing a window does not
confirm that execution has stopped.
