#!/usr/bin/env python3
"""Generate French source speech, then convert it with the supplied Ordis RVC v2 model."""
import argparse
import gc
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import time
import wave

os.environ.setdefault('OMP_NUM_THREADS', '2')
os.environ.setdefault('OPENBLAS_NUM_THREADS', '2')
os.environ.setdefault('MKL_NUM_THREADS', '2')
ROOT = Path(__file__).resolve().parents[2]
VOICE = Path(__file__).resolve().parent
WORK = VOICE / 'work'
OUT = ROOT / 'examples/avatar-playground/public/audio/ordis'


def read_phrases(ids, language, script="actions"):
    document = json.loads((VOICE / (('mission.' if script == 'mission' else 'phrases.') + language + '.json')).read_text())
    selected = set(ids.split(',')) if ids else None
    phrases = [item for item in document['phrases'] if not selected or item['id'] in selected]
    if not phrases or (selected and selected != {item['id'] for item in phrases}):
        raise ValueError('Unknown or empty phrase selection')
    for item in phrases:
        if not re.fullmatch(r'[a-z][a-z0-9_-]{0,63}', item['id']):
            raise ValueError('Invalid phrase identifier')
    return document, phrases


def source_speech(phrases, source_model, force=False):
    from piper import PiperVoice, SynthesisConfig
    (WORK / 'source').mkdir(parents=True, exist_ok=True)
    voice = PiperVoice.load(str(source_model))
    config = SynthesisConfig(length_scale=1.04, noise_scale=.5, noise_w_scale=.65)
    for item in phrases:
        target = WORK / 'source' / (item['id'] + '.wav')
        metadata = target.with_suffix('.source.json')
        if target.exists() and not force:
            if not metadata.exists() or json.loads(metadata.read_text())['text'] != item['text']:
                raise ValueError('Source text changed; regenerate with --force: ' + item['id'])
            continue
        with wave.open(str(target), 'wb') as stream:
            voice.synthesize_wav(item['text'], stream, syn_config=config)
        metadata.write_text(json.dumps({'text': item['text']}, ensure_ascii=False) + '\n')
        print('SOURCE ' + item['id'], flush=True)
    del voice
    gc.collect()


def configure_rvc(pitch, index_rate):
    import torch
    import rvc_python.infer as runtime
    torch.set_num_threads(2)
    torch.set_num_interop_threads(1)
    # CPU inference uses the Torch RMVPE model; the optional ONNX model is unnecessary.
    # Validate explicit local assets instead of invoking the package's automatic downloader.
    base = Path(runtime.__file__).parent / 'base_model'
    base.mkdir(exist_ok=True)
    for filename in ['hubert_base.pt', 'rmvpe.pt']:
        asset = VOICE / 'models/rvc-base' / filename
        if not asset.is_file() or asset.stat().st_size < 1_000_000:
            raise FileNotFoundError('Missing base asset: ' + str(asset))
        destination = base / filename
        if not destination.exists():
            destination.symlink_to(asset)
    runtime.download_rvc_models = lambda _directory: None
    converter = runtime.RVCInference(device='cpu', models_dir=str(VOICE / 'models'))
    converter.load_model(str(VOICE / 'models/ordis/Ordis.pth'),
                         index_path=str(VOICE / 'models/ordis/added_IVF108_Flat_nprobe_1_Ordis_v2.index'), version='v2')
    converter.set_params(f0method='rmvpe', f0up_key=pitch, index_rate=index_rate,
                         filter_radius=3, rms_mix_rate=.7, protect=.33)
    return converter


def convert_speech(phrases, pitch, index_rate, force=False):
    import numpy as np
    import soundfile as sf
    OUT.mkdir(parents=True, exist_ok=True)
    (WORK / 'converted').mkdir(parents=True, exist_ok=True)
    converter = configure_rvc(pitch, index_rate)
    for item in phrases:
        source = WORK / 'source' / (item['id'] + '.wav')
        raw = WORK / 'converted' / (item['id'] + '.wav')
        final = OUT / (item['id'] + '.wav')
        metadata = raw.with_suffix('.generation.json')
        expected = {'text': item['text'], 'pitchSemitones': pitch, 'indexRate': index_rate}
        if final.exists() and not force:
            if not metadata.exists() or json.loads(metadata.read_text()) != expected:
                raise ValueError('Text or conversion parameters changed; use --force: ' + item['id'])
            print('REUSE ' + item['id'], flush=True)
            continue
        started = time.monotonic()
        source_metadata = source.with_suffix('.source.json')
        if not source_metadata.exists() or json.loads(source_metadata.read_text())['text'] != item['text']:
            raise ValueError('Regenerate the French source first: ' + item['id'])
        converter.infer_file(str(source), str(raw))
        samples, rate = sf.read(raw)
        if len(samples) < rate * .3 or not np.isfinite(samples).all() or np.max(np.abs(samples)) < .001:
            raise RuntimeError('Invalid converted speech: ' + item['id'])
        # Keep the model's timbre. Only remove rumble, normalize speech and prevent clipping.
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(raw),
                        '-af', 'highpass=f=55,loudnorm=I=-18:TP=-1.5:LRA=9,afade=t=in:st=0:d=0.008',
                        '-ar', '40000', '-ac', '1', '-c:a', 'pcm_s16le', str(final)], check=True)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(final),
                        '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '160k', str(OUT / (item['id'] + '.mp3'))], check=True)
        metadata.write_text(json.dumps(expected, ensure_ascii=False) + '\n')
        print('ORDIS ' + item['id'] + ' %.1fs' % (time.monotonic() - started), flush=True)


def manifest(document, pitch, index_rate):
    import numpy as np
    import soundfile as sf
    clips = []
    for item in document['phrases']:
        wav = OUT / (item['id'] + '.wav')
        mp3 = OUT / (item['id'] + '.mp3')
        if not wav.exists() or not mp3.exists():
            continue
        samples, rate = sf.read(wav)
        generation = json.loads((WORK / 'converted' / (item['id'] + '.generation.json')).read_text())
        clips.append({**item, 'text': generation['text'], 'generation': {key: value for key, value in generation.items() if key != 'text'}, 'duration': round(len(samples) / rate, 3), 'sampleRate': rate,
                      'wav': '/audio/' + OUT.name + '/' + wav.name, 'mp3': '/audio/' + OUT.name + '/' + mp3.name,
                      'sha256': hashlib.sha256(wav.read_bytes()).hexdigest(),
                      'peak': round(float(np.max(np.abs(samples))), 5),
                      'rms': round(float(np.sqrt(np.mean(samples ** 2))), 5)})
    current = all(clip['text'] == next(item['text'] for item in document['phrases'] if item['id'] == clip['id']) for clip in clips)
    result = {'version': 1, 'voice': document['requestedVoice']['name'], 'language': document['language'], 'kind': document.get('kind', 'generated-original'),
              'status': 'generated' if len(clips) == len(document['phrases']) and current else 'partial',
              'modelSha256': json.loads((VOICE / 'model-provenance.json').read_text())['files'][0]['sha256'],
              'pipeline': {'source': document.get('sourceVoice', {}).get('name', 'Piper fr_FR-tom-medium'), 'conversion': 'rvc-python 0.1.5 / Ordis RVC v2',
                           'pitchSemitones': clips[0]['generation']['pitchSemitones'] if clips and len({clip['generation']['pitchSemitones'] for clip in clips}) == 1 else None,
                           'indexRate': clips[0]['generation']['indexRate'] if clips and len({clip['generation']['indexRate'] for clip in clips}) == 1 else None, 'f0': 'rmvpe', 'device': 'cpu'},
              'clips': clips}
    if clips:
        (OUT / 'manifest.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--script', choices=['actions', 'mission'], default='actions')
    parser.add_argument('--language', choices=['en', 'fr'], default='en')
    parser.add_argument('--stage', choices=['source', 'convert', 'all'], default='all')
    parser.add_argument('--ids', default='')
    parser.add_argument('--pitch', type=int, default=0)
    parser.add_argument('--index-rate', type=float, default=.65)
    parser.add_argument('--force', action='store_true')
    args = parser.parse_args()
    global WORK, OUT
    if args.script == 'mission':
        if args.language != 'en':
            raise ValueError('Mission narration is English only')
        WORK = VOICE / 'work/mission'
        OUT = ROOT / 'examples/avatar-playground/public/audio/ordis-mission'
    elif args.language == 'en':
        WORK = VOICE / 'work/en'
        OUT = ROOT / 'examples/avatar-playground/public/audio/ordis-en'
    document, phrases = read_phrases(args.ids, args.language, args.script)
    if args.stage in ['source', 'all']:
        source_speech(phrases, ROOT / document.get('sourceVoice', {}).get('model', 'tooling/voice/models/piper/fr_FR-tom-medium.onnx'), args.force)
    if args.stage in ['convert', 'all']:
        convert_speech(phrases, args.pitch, args.index_rate, args.force)
        result = manifest(document, args.pitch, args.index_rate)
        print('PACK ' + result['status'] + ': ' + str(len(result['clips'])) + ' clips', flush=True)


if __name__ == '__main__':
    main()
