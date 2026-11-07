# Bibliothèque de sets d’animation — observation du navigateur

`action-library.webm` parcourt dix comportements dans la vue mobile 390 × 844 ; les images correspondantes permettent d’en inspecter les poses. Repos et rapport réutilisent les états déjà observés dans `artifacts/presence/`.

`browser-review.json` relève les poses, la progression des événements corrélés, la conservation d’un réglage de vitesse après rechargement et le refus d’un import invalide. La séquence outil → sous-agent → parole → fin d’ancien outil → fin de parole → fin de sous-agent revient correctement à la liaison puis au repos. Aucune erreur navigateur n’est remontée.

`roundtrip-review.json` documente l’import depuis le fichier exemple, l’export téléchargé, la création d’une variante et sa prévisualisation avec fermeture de l’atelier. Il contient aussi le cadrage 320 × 640, la conservation de la pause par défaut en mouvement réduit et la fin de deux sessions TTS : terminer la première conserve le niveau de la seconde ; terminer la dernière remet le niveau à zéro.

`exported-profile.v1.json` est le fichier réellement téléchargé depuis l’atelier. `summon-desktop.png`, `summon-narrow.png` et les vues de l’atelier montrent les configurations inspectées. Ces vérifications sont des parcours de navigateur, pas des tests unitaires.

La démonstration de summon affiche des contacts simulés. Aucun sous-agent externe n’est créé.
