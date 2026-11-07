// Explicit browser surface shared by development serving and static export.
// Companion host code, agent instructions and local models are never included.
export const browserFiles = [
  ['index.html', 'examples/avatar-playground/index.html'],
];
export const browserDirectories = [
  ['src/', 'examples/avatar-playground/src/'],
  ['packages/avatar/src/', 'packages/avatar/src/'],
  ['examples/signal-mission/src/', 'examples/signal-mission/src/'],
  ['vendor/three/', 'packages/avatar/vendor/three/'],
  ['fonts/', 'examples/avatar-playground/public/fonts/'],
  ['audio/', 'examples/avatar-playground/public/audio/'],
];
