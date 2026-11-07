# 0001 — Compagnon résident et séparation des agents

Statut : adopté pour l’organisation du dépôt.

## Contexte

Le dépôt initial livrait une page Three.js avec ateliers, voix et mission locale.
Le produit visé est un compagnon invocable par son nom depuis une autre application.
Une structure centrée sur une page web confondrait la présence visible et l’hôte
qui doit rester en veille.

## Décision

Préparer `apps/companion/` pour l’hôte résident, la surcouche et les réglages ;
`apps/runtime/` pour l’exécution des agents ; `agents/` pour Ordis, le cerveau et
les spécialistes. L’avatar existant devient un package réutilisable. La page
actuelle devient `examples/avatar-playground/` et la mission fictive est séparée
dans `examples/signal-mission/`.

La présence, la conversation, la parole et la tâche ont des cycles de vie distincts.
Le format d’avatar v1 est conservé dans `packages/contracts/`. Les adaptations
du système ont leur frontière dans `platform/`. L’outillage vocal est déplacé
dans `tooling/voice/`.

## Conséquences

Les commandes npm historiques restent des commandes de l’atelier navigateur.
Le serveur et l’export utilisent une même liste explicite de ressources.
Les composants futurs ont une responsabilité documentée, sans simulation de
fonctionnement ni dépendance native choisie prématurément.

Le choix de la coque, du premier OS, de l’IPC, du SDK d’agent et des fournisseurs
reste ouvert. L’arborescence n’impose pas une architecture distribuée.
