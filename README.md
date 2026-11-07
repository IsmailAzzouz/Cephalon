# Céphalon — Ordis

Céphalon prépare un compagnon de bureau résident. L’Opérateur pourra appeler
« Hey Ordis » depuis une autre application, voir apparaître Ordis à l’écran et
lui confier une tâche. Ordis dialogue ; un agent cerveau organise le travail et
fait intervenir des agents spécialisés.

**État actuel :** l’avatar et son atelier navigateur fonctionnent. La structure
du compagnon, du runtime et des agents est préparée et documentée. La détection
du nom, la surcouche native, le STT, le TTS à la demande et les vrais agents ne
sont pas encore implémentés. Aucune coque de bureau ni aucun SDK d’agent n’est
choisi à ce stade.

## Développer l’avatar

Node.js 20+ suffit ; Three.js, les polices et les clips audio sont locaux.
Les commandes actuelles lancent **l’atelier navigateur**, pas le compagnon.

```bash
npm run dev
npm test
npm run build
npm run preview
```

Ouvrir l’adresse affichée par le serveur, par défaut `http://localhost:5173/`.
Pour limiter l’accès à ce PC : `npm run dev -- --host 127.0.0.1`.
Le serveur de développement écoute par défaut sur `0.0.0.0` pour garder l’aperçu
sur téléphone. Si le port est occupé, utiliser `--port 5174`.

L’atelier conserve les entrées `?debug`, `?mission=1`, `?showcase=1`,
`?animation=summon`, `?voice=en` et `/src/review.html?stage=7`.
`dist/` contient seulement l’export statique de cet atelier.

## Organisation

| Dossier | Rôle et état |
| --- | --- |
| `apps/companion/` | Futur hôte résident, surcouche et réglages ; périmètre documenté |
| `apps/runtime/` | Futur processus d’exécution des agents ; périmètre documenté |
| `agents/ordis/` | Rôle conversationnel et personnalité à implémenter |
| `agents/brain/` | Planification, délégation et vérification à implémenter |
| `agents/specialists/` | Missions des futurs spécialistes, dont computer use |
| `packages/avatar/` | Rendu Three.js, animations, analyse audio et adaptateur d’événements existants |
| `packages/contracts/` | Contrat d’avatar v1 existant ; futurs échanges à définir |
| `packages/agent-runtime/` | Emplacement des mécanismes communs d’exécution |
| `packages/tools/` | Emplacement des capacités exécutables |
| `packages/integrations/` | Emplacement des adaptateurs de modèles, voix et services |
| `platform/` | Frontières d’intégration Linux, Windows et macOS, sans implémentation |
| `examples/avatar-playground/` | Atelier navigateur, voix de démonstration et réglages visuels |
| `examples/signal-mission/` | Scénario fictif et tests de mission |
| `tooling/voice/` | Génération vocale hors ligne et provenance des modèles |
| `tests/integration/` | Vérification de la surface HTTP et de l’export navigateur |
| `artifacts/` | Captures, enregistrements et contrôles historiques conservés |

Les composants JavaScript existants sont organisés en workspaces npm privés.
Leur exécution actuelle ne nécessite pas d’installation réseau. Les dossiers
réservés aux futures fonctionnalités contiennent des README, sans services fictifs.

## Repères

- [Produit cible](PRODUCT.md)
- [Architecture et limites des composants](docs/architecture.md)
- [Rôles des agents](docs/agent-roles.md)
- [Échanges et séparation présence / conversation / tâche](docs/protocol.md)
- [Étapes suivantes](docs/roadmap.md)
- [Guide détaillé de l’avatar](docs/avatar-guide.md)
- [Intégrer les événements d’un agent](docs/AGENT_INTEGRATION.md)
- [Génération vocale](tooling/voice/README.md)
- [Réorganisation du dépôt](docs/decisions/0001-resident-companion.md)
- [Vérifications de la préparation](docs/preparation-verification.md)

Les anciennes notes de reconstruction et de vérification sont dans
`docs/history/`. Les contraintes visuelles de l’avatar sont dans
[packages/avatar/DESIGN.md](packages/avatar/DESIGN.md).
