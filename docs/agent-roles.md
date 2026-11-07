# Rôles des agents

Ces rôles décrivent la cible ; aucun agent connecté à un modèle n’est encore livré.

| Agent | Responsabilité | Résultat attendu |
| --- | --- | --- |
| Ordis | Accueillir, clarifier, dialoguer, transmettre la demande et présenter les résultats | Échange compréhensible avec l’Opérateur |
| Cerveau | Définir le plan, choisir les moyens, déléguer, vérifier et synthétiser | Résultat étayé et état exact du travail |
| Computer use | Conduire une mission sur une interface informatique | Actions réalisées, observations, limites et résultat |
| Recherche | Chercher, croiser et attribuer les informations | Réponse accompagnée de sources et d’incertitudes |
| Code | Inspecter, modifier et vérifier un projet dans le périmètre confié | Changements, validation et limites |

Ordis et le cerveau sont les deux rôles principaux d’une session. Cela n’impose
pas deux boucles LLM permanentes. Les spécialistes sont sollicités selon la tâche.

Ordis est un agent conversationnel ; son cristal est un composant de rendu.
Le cerveau détient l’état du travail. Ordis peut parler à l’Opérateur pendant une
mission et lui demander une précision sans réinitialiser ce travail.

Une délégation contient un objectif, le contexte utile, les capacités autorisées,
les contraintes, un critère de fin et une référence à la tâche parente.
Le spécialiste renvoie son résultat, les éléments qui l’étayent et les éventuels
blocages. Le cerveau décide de la suite et relaie par Ordis les questions humaines.

Les instructions de rôle prendront place à côté de leur implémentation dans
`agents/<rôle>/`. Les mécanismes communs appartiennent à `packages/agent-runtime/`,
les outils à `packages/tools/` et les adaptateurs de fournisseurs à
`packages/integrations/`.
