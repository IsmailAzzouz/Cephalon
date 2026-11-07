# Suite de la préparation

1. Choisir le premier système et environnement graphique ciblés, puis la coque
   de bureau. Vérifier apparition au-dessus d’une application, placement sur
   plusieurs écrans, focus clavier et interaction avec la souris.
2. Construire l’hôte résident avec activation manuelle, réglages et surcouche
   utilisant `packages/avatar/`. Vérifier qu’un masquage ne ferme pas l’hôte.
3. Définir le contrat hôte / runtime, la reconnexion et la récupération d’état.
   Relier une session Ordis au cerveau avec un premier modèle.
4. Ajouter la chaîne audio : capture possédée par l’hôte, détection du nom,
   STT, TTS, interruption et prévention des réactivations par la propre voix d’Ordis.
   L’activation manuelle reste disponible lorsque l’écoute est désactivée.
5. Introduire une première tâche réelle, puis computer use comme spécialiste.
   Vérifier délégation, résultat, demande de précision et annulation.
6. Ajouter la persistance nécessaire pour retrouver les tâches après redémarrage,
   puis valider les parcours complets sur le système choisi.

Le critère produit est de pouvoir appeler Ordis depuis une autre application,
lui confier une tâche, le masquer, le rappeler et retrouver un état exact du
travail. Les autres plateformes seront ajoutées après validation de ce parcours.
