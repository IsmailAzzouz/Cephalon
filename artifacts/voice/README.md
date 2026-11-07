# Clips Ordis — contrôles des fichiers et du navigateur

Les douze répliques françaises sont générées localement avec le modèle Ordis fourni, après synthèse française Piper. Le manifeste public conserve les fichiers, durées et SHA-256.

- `file-review.json` : décodage des MP3, codecs, fréquence d’échantillonnage, niveaux et valeurs finies.
- `browser-review.json` : choix des douze clips, téléchargement, lecture réelle et analyse RMS / bandes, canal microphone nul, arrêt et régression de la lecture d’un WAV importé.
- `library-mobile.png`, `library-narrow.png` : atelier vocal à 390 × 844 et 320 × 640.
- `speaking-real-audio.png` : projection avec les ondes pilotées par la réplique réelle.
- `downloaded-summon.mp3` : fichier effectivement téléchargé via l’interface.
- `intelligibility-review.json` : transcription automatique indicative de trois répliques. Le transcripteur commet des erreurs ; ce relevé ne remplace pas une écoute humaine et n’évalue pas la ressemblance à Ordis.

Aucun test unitaire ajouté ni exécuté. Chromium utilise WebGL logiciel et une émulation tactile ; le téléphone réel et Safari restent à apprécier par l’utilisateur.

La passe anglaise ajoute `english-browser-review.json`, les vues `english-speaking.png`, `official-library-mobile.png` et `official-library-narrow.png`, ainsi que `english-transcription.json`. L’anglais est le défaut, les douze créations anglaises et françaises restent distinctes des quatre extraits du jeu. `official-cue-timing.json` est un alignement automatique approximatif du court extrait de référence ; il sert à situer sa réaction glitch, pas à produire une transcription éditoriale.
