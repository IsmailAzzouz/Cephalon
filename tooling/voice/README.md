# Voix anglaises et françaises d’Ordis

Les **12 répliques anglaises originales** de `phrases.en.json` sont la collection par défaut. Les **12 françaises** de `phrases.fr.json` restent accessibles. Elles sont générées avec le modèle fourni dans `tooling/voice/ordis_robotic_voice_warframe_13875.zip` dans ce dossier. Le ZIP contient `Ordis.pth` et `added_IVF108_Flat_nprobe_1_Ordis_v2.index` ; le checkpoint annonce RVC v2, 40 kHz, F0 actif et 1000 epochs. Le locuteur utilisé est 0.

Les commandes ci-dessous se lancent depuis la racine du dépôt. L’environnement
`.venv-voice/` reste à la racine.

La chaîne locale produit d’abord la parole avec Piper `en_US-ryan-high` pour l’anglais ou `fr_FR-tom-medium` pour le français, puis la convertit avec **Ordis.pth et son index** via RVC / RMVPE. La voix finale passe bien par le modèle Ordis fourni. Une normalisation de volume et un filtre à 55 Hz précèdent les exports. Aucun effet robotique supplémentaire ne remplace le modèle.

## Extraits du jeu et textes originaux

Quatre courts enregistrements anglais sont récupérés depuis les liens audio de la [page Ordis/Quotes du WARFRAME Wiki](https://wiki.warframe.com/w/Ordis/Quotes). Ils sont dans `examples/avatar-playground/public/audio/ordis-official/`, avec les OGG d’origine, une conversion MP3 pour la lecture et un manifeste d’attribution. La sélection est décrite dans `official-selection.json`.

L’extrait `DIdle080Ordis_en.ogg`, fourni en référence par l’utilisateur, est récupéré sur le wiki actuel. Son passage colérique déclenche une rupture visuelle vers 1,2 seconde ; ce repère approximatif est fondé sur un alignement automatique des mots et suit le temps de l’élément audio. Il ne se redéclenche pas pendant la même lecture et est désactivé en pause ou en mouvement réduit. Les enregistrements appartiennent à Digital Extremes / Warframe ; ils ne sont pas présentés comme des générations du modèle ou comme des fichiers sous la licence du code.

Les douze textes écrits pour les actions sont **originaux**, inspirés du ton poli, hésitant et parfois instable du personnage. Ils ne sont pas étiquetés comme des citations officielles. Les enregistrements du jeu sont dans une collection distincte et sont exclus du ZIP des répliques générées.

## Écouter et récupérer les fichiers

- Anglais généré : **http://192.168.129.101:5173/?voice=en**.
- Extraits du jeu : **http://192.168.129.101:5173/?voice=official**.
- Français : **http://192.168.129.101:5173/?voice=fr**. Choisir une réplique, puis **Écouter avec l’avatar**. L’atelier se ferme pour voir la projection et les ondes réagissent au vrai RMS / aux bandes audio.
- Exemple anglais généré : **http://192.168.129.101:5173/audio/ordis-en/summon.mp3**.
- Exemple de jeu : **http://192.168.129.101:5173/audio/ordis-official/glitch.mp3**.
- Lot anglais généré : **http://192.168.129.101:5173/audio/ordis-en/ordis-en-pack.zip**.
- Lot français généré : **http://192.168.129.101:5173/audio/ordis/ordis-fr-pack.zip**.

Les sorties générées sont dans `examples/avatar-playground/public/audio/ordis-en/` et `examples/avatar-playground/public/audio/ordis/` : WAV mono 40 kHz, MP3 mono 44,1 kHz / 160 kb/s, manifeste des textes, durées, niveaux et empreintes SHA-256. La lecture n’envoie rien à un service distant et nécessite un appui de l’utilisateur pour autoriser l’audio du navigateur.

```js
await cephalon.voices.ready;
cephalon.voices.clips; // la collection actuellement sélectionnée
cephalon.voices.setCollection('official');
await cephalon.playVoice('en:summon');
await cephalon.playVoice('official:glitch');
await cephalon.playVoice('fr:summon');
cephalon.stopAudio();
```

La lecture d’un clip est un aperçu vocal : elle interrompt la mission / la présentation et utilise l’état de parole. Les métadonnées `animation` indiquent le contexte associé à la réplique ; elles ne forcent pas simultanément l’état de lecture ou d’écoute pendant la parole. Le STT et la génération TTS à la demande d’un agent externe restent des intégrations distinctes.

## Régénérer sur ce PC

La mission possède un script anglais dédié, `mission.en.json`, et dix clips dans `examples/avatar-playground/public/audio/ordis-mission/` : sept étapes et trois répliques de repli. Le rapport principal cite le relais E-17, +34 % et 98 % uniquement si ces valeurs correspondent au résultat courant. Les cas sans source ou avec d’autres données sélectionnent un message prudent. Ces textes sont originaux, pas des enregistrements du jeu.

```bash
.venv-voice/bin/python tooling/voice/generate.py --script mission --language en
```

`MissionNarration.js` précharge et décode les clips au premier appui de démarrage, puis utilise des sources Web Audio : toute la mission fonctionne après ce seul geste, sans nouvelle demande de lecture à chaque phase. La pause mémorise l’offset, et la reprise recrée la source à cet endroit. L’activité vocale est distincte de la posture de travail ; la simulation est désactivée pendant la mission. La préférence de réduction du mouvement ne suspend pas sa narration.

L’environnement isolé `.venv-voice` et les modèles locaux sont déjà préparés. Node.js et le site ne dépendent pas de Python pour lire les clips.

```bash
.venv-voice/bin/python tooling/voice/generate.py --language en
# Après une modification des textes :
.venv-voice/bin/python tooling/voice/generate.py --language en --force
# Une seule réplique :
.venv-voice/bin/python tooling/voice/generate.py --language en --ids summon --force
```

`--language en` est le défaut ; `--language fr` régénère le français sans écraser les clips anglais. `--stage source` produit seulement la voix source ; `--stage convert` effectue la conversion Ordis. `--pitch` et `--index-rate` règlent la transposition et le poids de l’index ; le lot livré utilise 0 demi-ton et 0,65. Pour changer ces paramètres dans le lot entier, régénérer toutes les répliques avec `--force`. Les fichiers intermédiaires français restent dans `tooling/voice/work/` ; les anglais utilisent `tooling/voice/work/en/`.

Le manifeste est écrit quand la conversion se termine et précise `generated` uniquement lorsque les douze répliques sont présentes. Les clips existants sont réutilisés sauf avec `--force`.

## Réinstaller l’environnement

Python **3.10** est utilisé pour les dépendances anciennes de RVC. `uv`, un compilateur C/C++ et FFmpeg sont nécessaires pour préparer la chaîne. La version PyPI de Fairseq 0.12.2 omet un fichier C++ ; la source officielle au tag v0.12.2 a été compilée à la place. PyWorld est fixé à 0.3.2 pour rester compatible avec Cython 0.29.37.

```bash
uv venv --python 3.10 --seed .venv-voice
.venv-voice/bin/python -m pip install pip==24.0 setuptools==69.5.1 wheel==0.43.0
.venv-voice/bin/python -m pip install torch==2.1.2+cpu torchaudio==2.1.2+cpu --index-url https://download.pytorch.org/whl/cpu
.venv-voice/bin/python -m pip install numpy==1.23.5 Cython==0.29.37 hydra-core==1.0.7 omegaconf==2.0.6
MAX_JOBS=2 .venv-voice/bin/python -m pip install --no-build-isolation -r tooling/voice/requirements.txt
```

Placer les fichiers de l’archive dans `tooling/voice/models/ordis/`. Les autres fichiers nécessaires sont :

- `tooling/voice/models/piper-en/en_US-ryan-high.onnx` et son `.onnx.json`, depuis [Piper Ryan](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ryan/high).
- `tooling/voice/models/piper/fr_FR-tom-medium.onnx` et son `.onnx.json`, depuis [Piper Tom](https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/tom/medium).
- `tooling/voice/models/rvc-base/hubert_base.pt` et `rmvpe.pt`, depuis [les modèles de base indiqués par rvc-python](https://huggingface.co/Daswer123/RVC_Base).

Le générateur valide la présence de ces fichiers et relie les modèles de base à l’environnement Python. Il évite le téléchargement automatique du modèle RMVPE ONNX, inutile pour cette conversion CPU avec Torch. `runtime.lock.txt` conserve les versions effectivement utilisées. Les modèles, l’archive et l’environnement sont exclus du suivi Git ; ils ne sont pas copiés dans le build du site.

## Provenance et contrôles

`model-provenance.json` consigne les empreintes de l’archive, de ses deux fichiers et des modèles de support. Source Ordis : [101soundboards](https://www.101soundboards.com/tts/1033939-ordis-robotic-voice-warframe-sq-tts-text-to-speech), archive téléchargée par l’utilisateur. Aucune licence n’est incluse dans cette archive. [rvc-python](https://github.com/daswer123/rvc-python) est publié sous MIT ; [Piper](https://github.com/OHF-Voice/piper1-gpl) sous GPL-3.0. La fiche de Piper Ryan indique CC BY-NC-SA 4.0 pour son jeu de données ; celle de Piper Tom indique AGPLv3. Ces fichiers de modèle ne sont pas redistribués dans le lot des clips.

Les fichiers sont décodés et contrôlés pour leur durée, les valeurs finies, le niveau non nul et les crêtes. Le parcours navigateur observe une lecture réelle, des bandes audio / RMS non nuls, un canal microphone nul, l’arrêt, le téléchargement et la lecture d’un WAV importé. Les captures et relevés sont dans `artifacts/voice/`.

Une transcription automatique de trois extraits est conservée comme contrôle indicatif : elle reconnaît l’essentiel mais commet des erreurs, notamment sur « Opérateur ». Elle ne remplace pas une écoute humaine. Aucune écoute humaine ni validation de ressemblance vocale n’est revendiquée ici. Aucun test unitaire n’a été ajouté ni exécuté.
