# Présence d’Ordis — observation du rendu

`ordis-live.webm` enregistre la mission complète en vue tactile 390 × 844 dans Chromium avec WebGL logiciel. Les neuf images capturent l’écoute, la réflexion, la lecture à gauche et à droite, la découverte, l’inspection, le recoupement, le rapport et le début du retour au repos.

`visual-review.json` contient les postures relevées pendant ce rendu, leurs amplitudes et les erreurs navigateur (aucune remontée). Il s’agit d’une observation visuelle et d’un enregistrement, sans suite de tests unitaires.

`10-desktop-reading.png` montre la lecture à 1440 × 900. La pause a également été observée : elle fige la posture.

La mission utilise des transmissions locales fictives. Les gestes de lecture suivent le parcours effectif des données. Le scénario se relance à `http://192.168.129.101:5173/?mission=1`.
