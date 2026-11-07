# Vérification de la préparation du dépôt

Vérification effectuée le 7 novembre 2026, après réorganisation.

## Contrôles réussis

- `npm install --offline --ignore-scripts` : trois workspaces locaux reliés,
  sans dépendance téléchargée ; lockfile ajouté.
- `npm test` : cinq fichiers de tests réussis, contenant 34 cas.
- `npm run build` : export statique de l’atelier généré dans `dist/`.
- Liaison des modules avec le chargeur ESM de Node : les 34 modules de l’atelier
  et l’entrée de revue se résolvent en développement et dans l’export. Cette
  vérification lie les modules, sans exécuter le rendu WebGL.
- Résolution HTTP des ressources : polices et 38 clips des quatre catalogues
  disponibles, en développement comme dans l’export.
- Comparaison des 125 fichiers exportés avec les réponses du serveur de
  développement : contenus identiques. Aucun dossier d’hôte, d’agent, d’outillage
  ou de modèle vocal n’est inclus dans l’export.
- Vérification des entrées du générateur vocal : scripts anglais, français et
  mission lisibles ; modèles Piper résolus à leurs nouveaux emplacements.
  Les liens locaux RVC ont été ajustés après déplacement des modèles.
- Les 22 modules restés dans le cœur d’avatar et le contrat v1 sont identiques
  aux sources antérieures. Les autres déplacements concernent les ateliers,
  le scénario, le bridge et les points d’entrée.
- Liens locaux de la documentation courante vérifiés.

## Tests existants remis en cohérence

Avant la réorganisation, trois cas de mission attendaient des libellés français
alors que le scénario livré est en anglais. Les assertions suivent désormais les
libellés anglais et conservent les vérifications de résultats et d’incertitude.

Le test des fragments utilisait les réglages par défaut, qui désactivent les
fragments. Il active maintenant explicitement cette couche et son intensité pour
vérifier son apparition puis son retour au repos. Le rendu n’a pas été modifié.

## Limites

Chromium n’a pas pu démarrer dans cet environnement : une opération système
requise par le navigateur est interdite. Aucun nouveau contrôle visuel, lecture
audio réelle ou parcours navigateur complet n’est donc revendiqué.
Les captures dans `artifacts/` proviennent des vérifications historiques.

Le générateur vocal a été contrôlé pour son aide CLI, ses entrées et ses chemins ;
aucune synthèse ou conversion vocale n’a été relancée.

Le compagnon résident, l’activation « Hey Ordis », les agents et la surcouche native
restent à implémenter. Les commandes actuelles vérifient l’atelier navigateur.
