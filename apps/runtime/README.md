# Agent runtime application

To implement. Assembles the conversation agent, brain and specialists with tools
and integrations. Owns agent sessions and task tracking.

Future modules will live in `src/sessions/`, `src/tasks/` and `src/bootstrap/`.
Shared mechanisms belong in `packages/agent-runtime/`. No SDK, transport or
storage has been selected. Work must be able to continue while the overlay is hidden.
