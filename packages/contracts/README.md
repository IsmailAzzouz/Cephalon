# Shared contracts

Available: `src/avatar-events.d.ts`, the unchanged avatar v1 contract.
The `@cephalon/contracts/avatar-events` export contains types only.

To define: session, activation, presence, task and delegation messages.
See [protocol.md](../../docs/protocol.md). These contracts will not depend on an
agent SDK, renderer or desktop shell. The avatar bridge does not yet validate a
runtime protocol.
