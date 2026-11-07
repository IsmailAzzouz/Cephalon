# Third-party notices

The root [MIT License](LICENSE) applies to original Céphalon code and documentation.
It does not replace upstream licenses or grant rights to third-party names,
characters, recordings, model weights or generated voices.

## Included dependencies

| Component | Location | License and attribution |
| --- | --- | --- |
| Three.js | `packages/avatar/vendor/three/` | MIT; copyright 2010–2025 three.js authors. Full [license](packages/avatar/vendor/three/LICENSE) is included. |
| Barlow and Barlow Condensed | `examples/avatar-playground/public/fonts/` | SIL Open Font License 1.1; copyright 2017 The Barlow Project Authors. Full [license](examples/avatar-playground/public/fonts/OFL.txt) is included. |

Preserve these notices when redistributing the files. The playground build copies
these license files along with the project license and this notice.

## Included voice assets — excluded from MIT

The following files are retained as demonstration material and are **not covered
by the project’s MIT License**, including when copied to `dist/`:

| Material | Location | Provenance and rights status |
| --- | --- | --- |
| Generated English dialogue | `examples/avatar-playground/public/audio/ordis-en/` | Original scripts; Piper Ryan source voice converted with the supplied Ordis RVC model. No open license for the resulting recordings is asserted. |
| Generated French dialogue | `examples/avatar-playground/public/audio/ordis/` | Original scripts; Piper Tom source voice converted with the supplied Ordis RVC model. No open license for the resulting recordings is asserted. |
| Generated English mission narration | `examples/avatar-playground/public/audio/ordis-mission/` | Original mission scripts; the same local conversion pipeline. No open license for the resulting recordings is asserted. |
| Four original game recordings and MP3 conversions | `examples/avatar-playground/public/audio/ordis-official/` | Digital Extremes / Warframe; per-file source pages and credits are in the manifest and `tooling/voice/official-selection.json`. No license is granted here for these recordings. |
| Downloaded voice example | `artifacts/voice/downloaded-summon.mp3` | Copy of the generated demonstration output; the same exclusion applies. |

The exclusions apply to WAV, MP3, OGG and voice-pack ZIP files and the media
within those archives. Sources and attribution do not establish a redistribution
license. The repository does not represent these recordings as MIT-licensed or
as cleared for unrestricted reuse. Obtain any required permissions from the
relevant rights holders before reuse or redistribution.

Each collection includes a `NOTICE.md`; manifests record scripts, settings,
durations and hashes. The Python pipeline and original text scripts are project
code and documentation; that does not license a third-party voice or recording.

## External models and voice tooling

Model weights and virtual environments are not included. The supplied Ordis RVC
archive contains no license according to the recorded provenance and is not
redistributed here. Piper / RVC tooling and source models retain their own
upstream terms. The provenance records document the local experiment; they do
not grant redistribution rights or establish the licensing of generated output.

See [tooling/voice/README.md](tooling/voice/README.md) and
[model-provenance.json](tooling/voice/model-provenance.json). No model is downloaded
automatically.

## Visual references and names

Ordis is the default draft profile; other names, voices and styles are planned.

Ordis and Warframe are associated with Digital Extremes. Céphalon is an independent
fan project and is not affiliated with or endorsed by Digital Extremes. No rights
to those names or characters are granted by the code license.

The crystal geometry and renderer are original project work. Screenshots and
silent recordings in `artifacts/` document the prototype. Their inclusion does
not grant additional rights to any third-party names or likenesses they depict.
