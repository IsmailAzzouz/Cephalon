# Reconstruction checks

Images 01–07 correspond to stages built in brief order.

| Capture | Check |
| --- | --- |
| 01.png | Closed hexahedron, readable points, no separated plates |
| 02.png | Main wave, waveform and 96 ticks on the horizontal plane |
| 03.png | Transparency, Fresnel, fractures and reflections |
| 04.png | Volumetric core and HDR bloom |
| 05.png | Colored diffusion, local dispersion and particles |
| 06.png | Response to simulated speech |
| 07.png | Brief glitch, increased dispersion and micro-fragments |

`final-mobile.png`, `final-speaking.png` and `final-desktop.png` show the complete
composition with controls. `final-debug.png` shows the editor. Browser workflow
and actual-signal details are in `browser-checks.json`.

- [x] Coherent silhouette and closed geometry.
- [x] Dark transparent material distinct from light emission.
- [x] HDR edges/core and selective multiscale bloom.
- [x] Horizontal main wave, central waveform and secondary crown.
- [x] Crystal rotation independent of the wave plane.
- [x] RMS and frequency bands from an actually played file.
- [x] Separate microphone analysis without speaker feedback.
- [x] Separate speaking and listening states.
- [x] Emotions supplied independently of volume.
- [x] Fragments absent at rest and restored after reaction.
- [x] Isolatable layers and independent optical parameters.
- [x] API ready to receive TTS/STT events.
- [ ] Comparison with four images not attached to the request.
- [ ] Final review of the new version on a physical phone.

This is historical evidence. Captures retain the original interface language.
