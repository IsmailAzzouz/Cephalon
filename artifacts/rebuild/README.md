# Contrôles de reconstruction

Les images 01 à 07 correspondent aux étapes construites dans l’ordre du cahier des charges.

| Capture | Contrôle |
| --- | --- |
| 01.png | Hexaèdre fermé, pointes lisibles, sans plaques écartées |
| 02.png | Onde principale, oscillogramme et 96 graduations sur le plan horizontal |
| 03.png | Transparence, Fresnel, fissures et reflets |
| 04.png | Noyau volumétrique et bloom HDR |
| 05.png | Diffusion colorée, dispersion locale et particules |
| 06.png | Réactivité à un signal de parole simulé |
| 07.png | Rupture brève, dispersion renforcée et micro-fragments |

`final-mobile.png`, `final-speaking.png` et `final-desktop.png` montrent la composition complète avec les commandes. `final-debug.png` montre l’atelier. Les détails du parcours navigateur et des signaux réels figurent dans `browser-checks.json`.

- [x] Silhouette cohérente et géométrie fermée.
- [x] Matière sombre et transparente, distincte des émissions lumineuses.
- [x] Arêtes et noyau HDR, bloom multi-échelle sélectif.
- [x] Onde principale horizontale, oscillogramme central et couronne secondaire.
- [x] Rotation du cristal indépendante du plan des ondes.
- [x] RMS et bandes de fréquences sur un fichier audio réellement lu.
- [x] Analyse microphone séparée, sans retour vers les haut-parleurs.
- [x] États de parole et d’écoute distincts.
- [x] Émotions fournies séparément du volume.
- [x] Fragments absents au repos et restaurés après réaction.
- [x] Couches isolables et paramètres optiques indépendants.
- [x] API prête pour recevoir des événements TTS / STT.
- [ ] Comparaison avec les quatre images non jointes au message.
- [ ] Appréciation finale de la nouvelle version sur le téléphone réel.
