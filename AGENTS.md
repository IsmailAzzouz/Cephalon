# Travailler dans Céphalon

- Lire `PRODUCT.md` et `docs/architecture.md` avant de modifier les frontières.
- Le produit cible est un compagnon de bureau résident, invocable par « Hey Ordis ».
  L’atelier navigateur est un outil de développement, pas l’application finale.
- Garder distincts l’agent Ordis, son avatar, le cerveau orchestrateur et les spécialistes.
- L’activation, la capture audio de bureau et la visibilité appartiennent à l’hôte
  du compagnon. Elles doivent rester indépendantes du rendu et de l’exécution LLM.
- Masquer la surcouche ne doit pas annuler une tâche. Interrompre une réponse
  vocale et annuler le travail sont deux commandes distinctes.
- `packages/avatar/` ne dépend ni des agents, ni de l’hôte natif, ni des exemples.
  Son audio actuel analyse des signaux pour l’animation ; il n’assure pas la veille vocale.
- Les scénarios fictifs, ateliers et clips de démonstration restent dans `examples/`.
- Les modules partagés restent dans `packages/`, les adaptateurs OS dans `platform/`.
  Les dossiers réservés n’imposent aucun framework avant le choix documenté de celui-ci.
- Préserver les identifiants corrélés et la compatibilité du contrat d’avatar v1.
  Ne pas le présenter comme le protocole complet du compagnon.
- Ne pas inclure modèles vocaux, secrets, environnements Python ou données locales
  dans l’export navigateur. Les routes exportées sont déclarées dans `scripts/layout.mjs`.
- Après une réorganisation, exécuter `npm test` et `npm run build`.
