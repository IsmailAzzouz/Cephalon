# Ordis clips — file and browser checks

Twelve French lines were generated locally with the supplied Ordis model after
Piper French synthesis. The public manifest records files, durations and SHA-256.

- `file-review.json`: MP3 decoding, codecs, sample rates, levels and finite values.
- `browser-review.json`: twelve choices, download, actual playback, RMS/band
  analysis, zero microphone level, stop and imported-WAV regression check.
- `library-mobile.png`, `library-narrow.png`: voice editor at 390 × 844 and 320 × 640.
- `speaking-real-audio.png`: waves driven by the actual line.
- `downloaded-summon.mp3`: file actually downloaded through the interface.
- `intelligibility-review.json`: indicative automatic transcription of three lines.
  The transcriber makes errors; this is neither human listening nor a voice-likeness evaluation.

No unit test was added or run in this pass. Chromium uses software WebGL and touch
emulation; a physical phone and Safari remain for user review.

The English pass adds `english-browser-review.json`, `english-speaking.png`,
`official-library-mobile.png`, `official-library-narrow.png` and
`english-transcription.json`. English is the default. Twelve English and twelve
French original lines remain distinct from four game excerpts. `official-cue-timing.json`
is an approximate automatic alignment used to locate the reference glitch,
not an editorial transcript.

Raw transcripts and historical UI observations retain their original language.
Recordings remain excluded from MIT; see the root third-party notices.
