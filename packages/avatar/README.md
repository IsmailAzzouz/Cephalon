# Avatar

Implémentation existante : rendu Three.js, contrôleur, animation, présence,
analyse audio et `AgentEventBridge`. Les ateliers et scénarios sont dans `examples/`.
Aucune dépendance aux vrais agents ou à l’hôte natif.

Le contrôleur et le bridge s’utilisent sans DOM ni Three.js. Le rendu utilise
`#three`, résolu par le package en Node et par une import map dans le navigateur.
Three.js et sa licence sont conservés dans `vendor/three/`.
Les modules sont exportés par sous-chemin, par exemple
`@cephalon/avatar/AvatarAnimationController` dans un environnement workspace installé.
L’atelier sans installation utilise directement les routes de sources.

Tests : `npm test --workspace @cephalon/avatar`.
Guide : [avatar-guide.md](../../docs/avatar-guide.md).
Contrat : [avatar-events.d.ts](../contracts/src/avatar-events.d.ts).
Le renderer actuel reste celui de l’atelier ; transparence native, focus et
suspension du rendu seront à traiter lors de l’intégration dans la surcouche.
