# Avatar

Existing implementation: Three.js rendering, controller, animation, presence,
audio analysis and `AgentEventBridge`. Editors and scenarios live in `examples/`.
No dependency on real agents or native host code.

The controller and bridge work without the DOM or Three.js. Rendering uses
`#three`, resolved by the package in Node and an import map in the browser.
Three.js and its license are retained in `vendor/three/`. Modules are exported
by subpath, for example `@cephalon/avatar/AvatarAnimationController` in an installed
workspace. The installation-free playground uses source routes directly.

Tests: `npm test --workspace @cephalon/avatar`.
Guide: [avatar-guide.md](../../docs/avatar-guide.md).
Contract: [avatar-events.d.ts](../contracts/src/avatar-events.d.ts).
The current renderer is still the playground renderer. Native transparency,
focus and render suspension will be addressed during overlay integration.
