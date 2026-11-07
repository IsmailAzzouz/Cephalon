# Next steps

1. Choose the first target OS and graphical environment, then the desktop shell.
   Verify appearance above another application, placement across screens,
   keyboard focus and mouse interaction.
2. Build the resident host with manual activation, settings and an overlay using
   `packages/avatar/`. Verify that hiding the overlay does not close the host.
3. Define the host/runtime contract, reconnection and state recovery. Connect
   a conversation session to the brain with an initial model.
4. Add host-owned audio capture, wake-phrase detection, STT, TTS and interruption.
   Prevent the companion’s own voice from activating it. Keep manual activation
   available when listening is disabled.
5. Introduce a real task, then computer use as a specialist. Verify delegation,
   results, clarification requests and cancellation.
6. Add persistence needed to recover tasks after a restart, then validate the
   complete workflow on the chosen system.

The product criterion is to call the companion from another application, assign
work, hide it, call it again and recover an accurate task state. Add other
platforms after validating this workflow.

Customization remains to be built: separate the chosen profile’s name, wake
phrase, voice, conversational tone and visual style from agent roles. Ordis is
the draft’s default profile, not the product’s required identity.
