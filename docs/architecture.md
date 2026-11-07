# Architecture cible

## Processus et responsabilités

Le compagnon est le point d’entrée du produit. Son hôte reste actif quand la
surcouche est cachée. Il détecte l’activation, ouvre la présence, gère le microphone
et la lecture, puis échange avec le runtime. La surcouche affiche l’avatar,
la conversation et l’activité utile à l’Opérateur.

Le runtime héberge Ordis, le cerveau et les spécialistes. L’application assemble
les rôles, les intégrations et les outils ; les mécanismes communs de cycle de vie
et de délégation seront dans `packages/agent-runtime/`.

```text
Opérateur
   ↕ activation, parole, saisie
Companion host ↔ Overlay → Avatar
   ↕ messages et événements
Runtime : Ordis ↔ Cerveau ↔ Spécialistes
                            ↕
                          Outils
```

Le runtime publie aussi l’activité destinée à l’affichage. Ce canal ne nécessite
pas qu’Ordis reformule chaque début ou fin d’outil. L’adaptateur de l’avatar
traduit cette activité en animations. Les agents ne pilotent pas des coordonnées
Three.js et n’ont pas connaissance des fenêtres natives.

## Frontières

- `apps/companion/host/` : activation, audio, présence, session interactive et connexion.
- `apps/companion/overlay/` : rendu et interactions visibles, sans contrôle système direct.
- `apps/companion/settings/` : configuration du compagnon et choix de l’Opérateur.
- `apps/runtime/` : démarrage, sessions des agents et suivi des tâches.
- `agents/` : comportements, instructions et logique propres aux rôles.
- `packages/avatar/` : représentation visuelle réutilisable et analyse de signaux.
- `packages/contracts/` : structures d’échange sans dépendance au SDK d’agent ou au rendu.
- `packages/tools/` : opérations invoquées par les agents. Un outil effectue une
  opération ; un spécialiste conduit une mission en utilisant des outils.
- `packages/integrations/` : adaptateurs de modèles, STT, TTS et services externes.
- `platform/` : implémentations dépendantes de l’OS ou de l’environnement graphique.

L’hôte possède le flux microphone de bureau et la lecture vocale. L’avatar peut
analyser les niveaux ou une sortie audio pour s’animer ; il ne possède pas la
veille vocale. Le rendu peut être suspendu sans arrêter l’activation.

## Cycles de vie distincts

| Domaine | Exemples d’états cibles |
| --- | --- |
| Activation | désactivée, en veille, détectée |
| Présence | masquée, visible |
| Conversation | au repos, en écoute, en réponse |
| Sortie vocale | silencieuse, en lecture, interrompue |
| Tâche | en attente, en cours, en attente d’information, terminée, annulée, échouée |

Masquer Ordis change sa présence. Couper sa parole interrompt la sortie vocale.
Annuler une tâche est une intention explicite transmise au cerveau et aux travaux
enfants. Ces actions ne doivent pas se déclencher mutuellement par défaut.

Une réactivation rejoint la session et les tâches connues. Une reconnexion doit
permettre de récupérer un état courant ; rejouer seulement des événements de
début serait insuffisant. Une indisponibilité du runtime doit être représentée
sans confondre perte de connexion et fin de tâche.

## Dépendances et mise en œuvre

Les applications peuvent assembler les packages et adaptateurs ; les packages
ne dépendent pas des applications ni des exemples. L’avatar n’importe aucun
code d’agent. Les spécialistes ne s’appellent pas librement en chaîne : le cerveau
reste responsable du plan et des délégations.

Les dossiers du compagnon et du runtime sont des périmètres préparés. Le choix
des processus, de l’IPC, du transport, de la persistance et de la coque native sera
documenté avant leur implémentation. Le découpage n’impose ni microservices ni
un processus par agent. L’isolation de computer use pourra être ajoutée au besoin.

## Existant préservé

Le serveur et le build exportent uniquement les chemins de `scripts/layout.mjs`.
L’atelier réutilise les sources de l’avatar et du scénario fictif sans les dupliquer.
La dépendance Three.js et sa licence sont locales à `packages/avatar/vendor/`.
Les bibliothèques vocale et d’animation ainsi que l’atelier optique appartiennent
à l’exemple navigateur, pas au noyau de rendu.

Les modèles vocaux et fichiers intermédiaires restent dans `tooling/voice/`,
hors Git et hors export. L’environnement existant `.venv-voice/` reste à la racine
pour conserver ses exécutables et chemins d’installation.
