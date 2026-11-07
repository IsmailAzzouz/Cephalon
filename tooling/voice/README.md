# Ordis English and French voices

Optional tooling for local experiments. Demo packs, catalogs and game excerpts
are included with attribution and explicit license exclusions. Model weights
are not included. The playground and unnarrated mission do not require Python.
Provenance records historical experiments; it is not a license to redistribute
voices. See [third-party notices](../../THIRD_PARTY_NOTICES.md). Each media
collection has its own notice and is excluded from the code’s MIT License.

The **12 original English lines** in `phrases.en.json` are the default collection.
The **12 French lines** in `phrases.fr.json` remain available. They were generated
using the supplied `tooling/voice/ordis_robotic_voice_warframe_13875.zip`, which is
not distributed. It contains `Ordis.pth` and
`added_IVF108_Flat_nprobe_1_Ordis_v2.index`. The checkpoint reports RVC v2, 40 kHz,
F0 enabled and 1000 epochs. Speaker ID is 0.

Run the commands below from the repository root. `.venv-voice/` stays at the root.

The pipeline first synthesizes speech using Piper `en_US-ryan-high` for English
or `fr_FR-tom-medium` for French, then converts it through **Ordis.pth and its
index** using RVC / RMVPE. The final voice actually passes through the supplied
model. Volume normalization and a 55 Hz high-pass precede export; no additional
robotic effect substitutes for the model.

## Game excerpts and original scripts

Four short English recordings were retrieved through audio links on the
[WARFRAME Wiki Ordis/Quotes page](https://wiki.warframe.com/w/Ordis/Quotes).
They are in `examples/avatar-playground/public/audio/ordis-official/`, with original
OGGs, MP3 conversions and an attribution manifest. Selection is documented in
`official-selection.json`.

The supplied `DIdle080Ordis_en.ogg` reference is available on the wiki. Its angry
passage triggers a visual glitch around 1.2 seconds, an approximate marker based
on automatic word alignment and the audio element’s time. It fires once per
playback and is disabled while paused or under reduced motion. These recordings
belong to Digital Extremes / Warframe; they are neither model generations nor
files under the code license.

The twelve action scripts are original, inspired by the character’s polite,
hesitant and occasionally unstable tone. They are not labeled as official quotes.
Game recordings remain in a separate collection and outside generated-dialogue ZIPs.

## Listen and download

- Generated English: **http://localhost:5173/?voice=en**.
- Game recordings: **http://localhost:5173/?voice=official**.
- French: **http://localhost:5173/?voice=fr**. Choose a line, then **Play with avatar**.
  The editor closes and waves respond to actual RMS/frequency bands.
- Generated English example: **http://localhost:5173/audio/ordis-en/summon.mp3**.
- Game example: **http://localhost:5173/audio/ordis-official/glitch.mp3**.
- English pack: **http://localhost:5173/audio/ordis-en/ordis-en-pack.zip**.
- French pack: **http://localhost:5173/audio/ordis/ordis-fr-pack.zip**.

Generated output lives in `examples/avatar-playground/public/audio/ordis-en/` and
`examples/avatar-playground/public/audio/ordis/`: mono 40 kHz WAV, mono 44.1 kHz
160 kb/s MP3, with scripts, durations, levels and SHA-256 in the manifest. Playback
does not send data to a remote service and requires a gesture to unlock browser audio.

```js
await cephalon.voices.ready;
cephalon.voices.clips; // currently selected collection
cephalon.voices.setCollection('official');
await cephalon.playVoice('en:summon');
await cephalon.playVoice('official:glitch');
await cephalon.playVoice('fr:summon');
cephalon.stopAudio();
```

Playing a clip is a voice preview: it interrupts the mission/showcase and uses
speech state. `animation` metadata describes context; it does not simultaneously
force reading/listening state during speech. STT and on-demand TTS from an external
agent remain separate integrations.

## Regenerate locally

The mission has a dedicated English script, `mission.en.json`, and ten clips in
`examples/avatar-playground/public/audio/ordis-mission/`: seven phases and three
fallbacks. The main report names Relay E-17, +34% and 98% only when those values
match the current result. No source or different data selects a cautious line.
These are original scripts, not game recordings.

```bash
.venv-voice/bin/python tooling/voice/generate.py --script mission --language en
```

`MissionNarration.js` preloads and decodes clips on the first Start press, then
uses Web Audio sources. One gesture unlocks the entire mission. Pause stores the
offset; resume recreates a source there. Speech activity is separate from work
posture; simulation is disabled during the mission. Reduced motion does not
suspend narration.

Prepare `.venv-voice` and models locally; neither is bundled. Node.js and the site
do not require Python for playback.

```bash
.venv-voice/bin/python tooling/voice/generate.py --language en
# After changing scripts:
.venv-voice/bin/python tooling/voice/generate.py --language en --force
# One line:
.venv-voice/bin/python tooling/voice/generate.py --language en --ids summon --force
```

`--language en` is the default; `--language fr` regenerates French without
overwriting English. `--stage source` generates source speech only; `--stage convert`
performs Ordis conversion. `--pitch` and `--index-rate` adjust transposition and
index weight. The delivered pack uses 0 semitones and 0.65. To change these for
the whole pack, regenerate all lines with `--force`. French intermediates stay
in `tooling/voice/work/`; English uses `tooling/voice/work/en/`.

The manifest is written after conversion and reports `generated` only when all
twelve lines are present. Existing clips are reused unless `--force` is supplied.

## Install the optional environment

Python **3.10** was used for older RVC dependencies. `uv`, a C/C++ compiler and
FFmpeg are needed. The PyPI Fairseq 0.12.2 package omits a C++ file, so the official
v0.12.2 source was built instead. PyWorld is pinned to 0.3.2 for Cython 0.29.37
compatibility. These instructions record the local pipeline used for this experiment.

```bash
uv venv --python 3.10 --seed .venv-voice
.venv-voice/bin/python -m pip install pip==24.0 setuptools==69.5.1 wheel==0.43.0
.venv-voice/bin/python -m pip install torch==2.1.2+cpu torchaudio==2.1.2+cpu --index-url https://download.pytorch.org/whl/cpu
.venv-voice/bin/python -m pip install numpy==1.23.5 Cython==0.29.37 hydra-core==1.0.7 omegaconf==2.0.6
MAX_JOBS=2 .venv-voice/bin/python -m pip install --no-build-isolation -r tooling/voice/requirements.txt
```

Place archive contents in `tooling/voice/models/ordis/`. Other required files:

- `tooling/voice/models/piper-en/en_US-ryan-high.onnx` and its `.onnx.json`, from
  [Piper Ryan](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ryan/high).
- `tooling/voice/models/piper/fr_FR-tom-medium.onnx` and its `.onnx.json`, from
  [Piper Tom](https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/tom/medium).
- `tooling/voice/models/rvc-base/hubert_base.pt` and `rmvpe.pt`, from
  [the base models listed by rvc-python](https://huggingface.co/Daswer123/RVC_Base).

The generator validates these files and links base models into the Python
environment. It avoids automatically downloading the unnecessary RMVPE ONNX
model for CPU/Torch conversion. `runtime.lock.txt` records the versions used.
Models, archive and environment are ignored by Git and omitted from the site build.

## Provenance and checks

`model-provenance.json` records archive, contained-file and support-model hashes.
Ordis source: [101soundboards](https://www.101soundboards.com/tts/1033939-ordis-robotic-voice-warframe-sq-tts-text-to-speech),
a user-supplied archive with no included license. The experiment’s documentation
records MIT for [rvc-python](https://github.com/daswer123/rvc-python), GPL-3.0 for
[Piper](https://github.com/OHF-Voice/piper1-gpl), CC BY-NC-SA 4.0 for the Ryan dataset
and AGPLv3 on the Tom model card. Consult upstream terms independently; none of
these statements grant a license to the generated voice. Model files are not
redistributed in the clip packs.

Files were decoded and checked for duration, finite values, nonzero levels and
peaks. Browser workflows observed actual playback, nonzero RMS/bands, zero microphone
level, stop, download and imported WAV playback. Captures and measurements are in
`artifacts/voice/` at the root.

Automatic transcription of three excerpts is retained as an indicative check.
It recognizes most content but makes errors, notably on the French word for
Operator. It does not replace human listening. No human listening or verified
voice-likeness evaluation is claimed. No unit tests were added or run for that
historical voice-generation pass.
