# 0001 — Resident companion and separate agent roles

Status: adopted for repository organization.

## Context

The original repository delivered a Three.js page with editors, voices and a local
mission. The intended product is a companion invoked by name from another application.
A page-centered structure would confuse visible presence with the host that must
continue listening for activation.

## Decision

Prepare `apps/companion/` for the resident host, overlay and settings;
`apps/runtime/` for agent execution; and `agents/` for the conversation role,
brain and specialists. The existing avatar becomes a reusable package. The current
page becomes `examples/avatar-playground/`; the fictional mission is separated
into `examples/signal-mission/`.

Presence, conversation, speech and tasks have distinct lifecycles. Preserve the
avatar v1 format in `packages/contracts/`. System adaptations have their boundary
in `platform/`. Move voice tooling into `tooling/voice/`.

The conversation role is `agents/companion/`. Ordis is the draft’s default profile,
with profile boundaries described in `presets/`, rather than the role’s fixed identity.

## Consequences

Existing npm commands continue to run the browser playground. Server and export
share an explicit resource list. Future components have documented responsibilities
without simulated functionality or a prematurely chosen native dependency.

Desktop shell, first target OS, IPC, agent SDK and providers remain open choices.
The directory structure does not require a distributed architecture.
