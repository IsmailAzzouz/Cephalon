# Resident host

To implement. Owns activation, audio streams and screen presence. Assembles
system adapters from `platform/` and connects to the runtime. It must not depend
on an active render loop or model availability.

Planned modules: `activation/`, `audio/`, `presence/`, `session/` and `connection/`.
Their responsibilities are described in their READMEs.
