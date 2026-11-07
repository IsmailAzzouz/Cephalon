# Mission avec narration anglaise

La mission utilise sept répliques dédiées, dont un rapport de 14,1 secondes fondé sur les résultats attendus du scénario. Trois clips de repli évitent d’annoncer ces résultats lorsque les données diffèrent. Les clips sont dans `public/audio/ordis-mission/` et leur script dans `voice/mission.en.json`.

`browser-review.json` observe la mission entière dans Chromium à 390 × 844 : appui unique, sept phases, sept clips, RMS réel, pause / reprise au même offset, fin du rapport, rejeu et arrêt. `edge-review.json` observe le petit écran en mouvement réduit, l’absence de source, un résultat modifié et l’annulation pendant la préparation. Aucune erreur JavaScript n’est remontée.

Les images montrent le rendu inspecté. `mission-visual.webm` enregistre l’image du navigateur et ne possède pas de piste audio ; le contrôle de la voix réelle repose sur le signal Web Audio, son offset et les fichiers générés. Aucun test unitaire ajouté ni exécuté. Le téléphone réel et Safari restent à apprécier par l’utilisateur.

Pour écouter la mission avec l’avatar : http://192.168.129.101:5173/?mission=1 puis **Start mission**. Le chargement de la page seul ne démarre pas le son.
