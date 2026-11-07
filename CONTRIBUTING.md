# Contributing to Céphalon

Please use English for contributions, documentation, issues and discussions. The project is
an early prototype: the browser avatar works, while the desktop companion and
agent runtime are still being designed.

## Before you start

Read [PRODUCT.md](PRODUCT.md), [the architecture](docs/architecture.md) and
[the roadmap](docs/roadmap.md). For a large feature or a new dependency, open an
issue explaining the behavior you want to build and how it fits those boundaries.
Small documentation fixes can go straight to a pull request.

Keep discussion respectful. Critique the work, explain your reasoning, and avoid
personal attacks, harassment and sharing other people’s private information.

## Local development

```bash
git clone https://github.com/IsmailAzzouz/Cephalon.git
cd Cephalon
npm ci --ignore-scripts
npm run dev -- --host 127.0.0.1
```

Node.js 20+ is sufficient for the playground. Voice tooling is optional and has
its own Python dependencies; it is not needed for normal contributions or CI.

Before submitting a code change, run:

```bash
npm test
npm run build
```

For visual changes, include the viewport size and a screenshot or short recording
of the result. Say which browsers and interactions you checked. Keep new tests
focused on behavior and failure cases rather than copying the implementation.

## Component boundaries

- Keep rendering in `packages/avatar/` independent of agents, native host code
  and demo scenarios.
- Keep desktop activation, microphone ownership and overlay visibility in the
  companion host. Hiding the overlay must not cancel work.
- Keep Ordis, the brain and specialists distinct. A specialist conducts a mission;
  a tool performs an operation.
- Ordis is a default draft profile. Keep names, voices and visual styles separate
  from the conversation role in `agents/companion/`; see `presets/` for the scope.
- Preserve the avatar v1 event contract unless a versioned migration is proposed.
- Place demos in `examples/`, system adapters in `platform/`, and shared code in
  `packages/`. Document decisions that affect these boundaries.

## Pull requests

Explain the problem, the resulting behavior, and how you verified it. Keep the
change focused. Update documentation when a command, setup step, public contract
or supported workflow changes. Link an issue when one exists; there is no required
commit-message format.

## Assets and dependencies

Include provenance and a redistributable license for any new dependency, image,
font, recording or model. Preserve upstream notices. Do not commit secrets,
local sessions, model weights, voice packs, virtual environments or generated builds.
The [third-party notices](THIRD_PARTY_NOTICES.md) describe the existing assets.

By submitting a contribution, you agree that your original contribution may be
distributed under the project’s MIT License. Identify any third-party material
and its license separately. No contributor agreement or sign-off is required.

For vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of posting an exploit
or sensitive data in a public issue.
