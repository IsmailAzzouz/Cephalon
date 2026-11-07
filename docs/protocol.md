# Échanges entre composants

## Contrat disponible

`packages/contracts/src/avatar-events.d.ts` conserve le contrat JSON d’avatar v1.
`packages/avatar/src/AgentEventBridge.js` l’applique au contrôleur. Il couvre les
actions visuelles, outils, sous-agents, états de parole / écoute, émotions et niveaux
audio. La référence d’intégration est dans `AGENT_INTEGRATION.md`.

Ce contrat reste utilisable et n’est pas modifié par la réorganisation. Ses
identifiants corrèlent des actions visuelles, pas encore des sessions ou tâches
persistantes. `reset` réinitialise l’avatar ; il ne représente pas l’annulation
d’un travail réel.

## Futur protocole du compagnon

Le format et le transport restent à définir. Les familles ci-dessous sont des
besoins de conception, pas des messages déjà acceptés par le bridge v1.

| Domaine | Échanges à prévoir | Propriétaire de l’état |
| --- | --- | --- |
| Activation | appel vocal, raccourci, commande manuelle | Hôte du compagnon |
| Présence | afficher, masquer, placer | Hôte du compagnon |
| Conversation | demande, précision, réponse, interruption | Session avec Ordis |
| Audio | début / fin de parole, coupure, niveaux | Hôte et adaptateurs vocaux |
| Travail | soumettre, progresser, demander une information, annuler, terminer | Cerveau dans le runtime |
| Délégation | créer une mission enfant, recevoir un résultat ou un blocage | Cerveau et spécialiste |
| Connexion | état de connexion et récupération d’un instantané courant | Hôte et runtime |

Les futurs messages devront porter une version, un identifiant et les références
nécessaires à leur corrélation : session, tâche, tâche parente ou réponse vocale.
Les commandes expriment une intention ; les événements décrivent les changements
effectifs. Les commandes répétées, événements retardés et reconnexions devront
être traités explicitement.

Le runtime émet des états sémantiques. Un adaptateur les projette vers les
événements d’avatar v1 ; la tâche ne dépend pas de la durée d’une animation.
Les niveaux audio fréquents restent distincts du journal métier des tâches.

Masquer, interrompre la parole et annuler une tâche doivent avoir des commandes
distinctes. Le propriétaire du travail confirme son annulation ; fermer une
fenêtre ne vaut pas confirmation d’arrêt.
