# Runtime des agents

À implémenter. Assemble les agents Ordis, cerveau et spécialistes avec les outils
et intégrations. Possède les sessions des agents et le suivi des tâches.

Les futurs modules seront organisés sous `src/sessions/`, `src/tasks/` et
`src/bootstrap/`. Les mécanismes communs appartiennent à `packages/agent-runtime/`.
Aucun SDK, transport ou stockage n’est encore choisi. Ce processus doit pouvoir
continuer le travail pendant que la surcouche est masquée.
