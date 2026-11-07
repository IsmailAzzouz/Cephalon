# Contrats partagés

Disponible : `src/avatar-events.d.ts`, contrat d’avatar v1 conservé sans changement.
L’export `@cephalon/contracts/avatar-events` contient uniquement des types.

À définir : messages de session, activation, présence, tâches et délégation.
Voir [protocol.md](../../docs/protocol.md). Ces contrats ne dépendront ni d’un SDK
d’agent, ni du rendu, ni de la coque de bureau. Le bridge d’avatar ne valide pas
encore un protocole de runtime.
