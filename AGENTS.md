# Working on Céphalon

- Read `PRODUCT.md` and `docs/architecture.md` before changing component boundaries.
- The target product is a resident desktop companion invoked by the selected
  profile’s name (“Hey Ordis” for the default profile). The browser playground is
  a development tool, not the final application.
- Keep the conversation agent (Ordis by default), its avatar, the brain
  orchestrator and specialists distinct.
- Activation, desktop audio capture and visibility belong to the companion host.
  They must remain independent of rendering and LLM execution.
- Hiding the overlay must not cancel a task. Interrupting a spoken reply and
  cancelling work are separate commands.
- `packages/avatar/` must not depend on agents, native host code or examples.
  Its audio code analyzes animation signals; it does not provide wake-word listening.
- Keep fictional scenarios, playgrounds and demo clips in `examples/`.
- Put shared modules in `packages/` and OS adapters in `platform/`. Reserved
  directories do not impose a framework before its selection is documented.
- Preserve correlated identifiers and compatibility with the avatar v1 contract.
  Do not describe it as the full companion protocol.
- Do not export voice models, secrets, Python environments or local session data
  to the browser. Export routes are declared in `scripts/layout.mjs`.
- After reorganizing files, run `npm test` and `npm run build`.
- Céphalon is the project; Ordis is only this draft’s default profile. Name,
  voice and style are intended to be customizable. Keep profiles separate from
  roles in `agents/` and from the runtime; their format is still to be defined.
- Demo media retained in this repository are not MIT-licensed. Preserve their
  notices and attribution when exporting them.
- Use English for project documentation, instructions, interface copy, diagnostics
  and code comments. Preserve original dialogue and transcription data when
  another language is part of the media itself.
