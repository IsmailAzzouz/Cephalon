# Relier un agent au Céphalon

Cette page décrit le contrat visuel v1 existant. Le protocole du futur compagnon
est décrit séparément dans [protocol.md](protocol.md).

Le rendu Three.js, le contrôleur et les événements de l’agent sont séparés. Le futur hôte choisira le transport : appel JavaScript, WebSocket, SSE ou relais IPC. Le Céphalon ne dépend d’aucun SDK d’agent et n’exécute pas les outils reçus. L’adaptateur anime leur activité.

## Essayer et personnaliser

Sur la page, **Animations → Sets d’animation** propose douze sets :

| Identifiant | Gestuelle |
| --- | --- |
| `idle` | Présence calme, regards occasionnels |
| `read` | Parcours de lignes, page gauche puis droite |
| `write` | Gestes courts vers une zone de travail, lignes qui s’écrivent, pauses de relecture |
| `listen` | Orientation vers l’Opérateur, inclinaison attentive et réaction au microphone |
| `speak` | Orientation vers l’Opérateur et accents liés aux phrases / transitoires audio |
| `think` | Regards décalés, pauses et retour de l’attention |
| `search` | Lecture plus rapide et balayage de sources |
| `analyse` | Rapprochement, inspection, recul pour réfléchir |
| `compare` | Alternance entre deux sources |
| `contact` | Orientation vers un contact, impulsion de liaison puis attente |
| `summon` | Appel vers un ou plusieurs sous-agents, double impulsion et observation des liaisons |
| `report` | Retour vers l’Opérateur, rapprochement et accents de présentation |

Un set associe un comportement, un état audio, une activité lumineuse, une direction d’attention et des réglages de mouvement. Les transitions passent par les ressorts amortis du directeur de présence. Les anneaux restent horizontaux.

L’atelier permet de régler vitesse, intensité, déplacement, inclinaison, rapprochement, direction et durée de prévisualisation. On peut dupliquer un set, lier les noms d’outils et importer / exporter le fichier JSON v1. Les réglages restent dans le stockage local du navigateur ; l’application d’intégration doit importer ce fichier elle-même pour les autres appareils.

`pulse` règle la pulsation physique du cube et ses décharges ; `radiance` règle l’émission énergétique associée. Le score commun synchronise corps, surfaces, noyau, ondes et rémanence. La parole conserve surtout son expressivité dans les ondes : seuls des accents de phrase espacés provoquent de petites tensions du cristal. Les nouveaux paramètres prennent la valeur 1 lorsqu’ils manquent dans une ancienne configuration v1.

Aperçu direct : `http://192.168.129.101:5173/?animation=summon`.

## API d’actions

```js
// Une action reste active jusqu’à sa fin explicite.
const read = cephalon.actions.start('read', { id: 'read-42', record: 'README.md' });
// ... le véritable outil lit le fichier ...
cephalon.actions.finish(read);

// Un aperçu se termine après la durée du set (ou la durée fournie).
cephalon.actions.play('summon', { duration: 7, agentCount: 3 });
cephalon.actions.snapshot();
cephalon.actions.stopAll();
```

`start(name, options)` renvoie un identifiant ; `finish(id)` et `cancel(id)` ne touchent qu’à cet identifiant. Un début répété avec le même identifiant est ignoré. L’identifiant est unique parmi toutes les actions en cours. Une fin inconnue est sans effet. Le paramètre `duration` de `start` est optionnel ; sans lui, l’action ne se termine pas automatiquement. `play` utilise la durée du profil.

Les actions se superposent par priorité : parole / rapport 90, écoute 80, contact / summon 60, autres 40. À priorité égale, la plus récente dirige la posture. Une action qui se termine révèle l’action encore active en dessous ; la fin d’un ancien outil ne coupe donc pas la parole en cours. `priority` permet de changer ce choix, entre 0 et 100. Quand tout est terminé, le contrôleur retrouve son état antérieur. Le temps des actions continue pendant une interruption, et la pause globale suspend leur horloge.

`agentCount` règle le nombre de points de liaison de 1 à 4. Plusieurs actions de contact actives alimentent aussi ce nombre. Ces points sont une représentation de présence ; aucun agent réel n’est créé par le Céphalon.

`cephalon.actions` conserve la source audio sélectionnée. La démonstration utilise un signal simulé. Le volume ne décide jamais de l’émotion.

## Événements JSON v1

Le point d’entrée est `cephalon.events.handle(event)`. Le contrat TypeScript est dans [`packages/contracts/src/avatar-events.d.ts`](../packages/contracts/src/avatar-events.d.ts).

```js
const send = event => cephalon.events.handle({ version: 1, ...event });

send({ type: 'tool.start', id: 'read-42', tool: 'read_file' });
send({ type: 'subagent.start', id: 'researcher-1', agentCount: 2 });

// La parole prend la priorité sur le travail de fond.
send({ type: 'speech.start', id: 'reply-1' });
send({ type: 'signals', signals: {
  outputVoiceLevel: 0.6,
  frequencyBands: [0.4, 0.7, 0.2]
}});
send({ type: 'tool.end', id: 'read-42' }); // la parole continue
send({ type: 'speech.end', id: 'reply-1' }); // retour vers les sous-agents
send({ type: 'subagent.end', id: 'researcher-1' });
```

| Événement | Champs spécifiques | Effet |
| --- | --- | --- |
| `action.start` | `id`, `animation` | Démarre le set nommé, y compris une variante personnalisée |
| `action.end` / `action.cancel` | `id` | Termine cette action |
| `tool.start` | `id`, `tool` | Résout le nom d’outil dans la table de liaisons |
| `tool.end` / `tool.error` | `id` | Termine cet outil ; erreur = petite rupture visuelle |
| `subagent.start` | `id`, `agentCount?` | Démarre le set summon et maintient la présence de liaison |
| `subagent.end` / `subagent.error` | `id` | Termine cette liaison |
| `speech.start` / `speech.end` | `id?` | Début / fin de parole TTS |
| `listening.start` / `listening.end` | `id?` | Début / fin d’écoute STT |
| `signals` | `signals` | RMS et bandes d’entrée / sortie, séparés |
| `emotion` | `emotion`, `intensity?` | Émotion explicite du système conversationnel |
| `reset` | — | Annule les actions et remet les niveaux audio à zéro |

Les événements de début acceptent aussi `focus: [x, y]`, `priority` et `agentCount`. Les coordonnées d’attention sont normalisées entre −1 et 1 (droite et haut positifs). Les identifiants doivent être uniques entre outils, sous-agents et parole. Sans `id`, les événements audio utilisent `audio:output` et `audio:input` ; fournir un identifiant distinct pour des sessions successives permet d’ignorer leurs fins tardives.

Les événements réels désactivent le signal audio simulé. Un `speech.start` silencieux n’invente pas de voix. Il faut fournir les niveaux audio ou connecter le flux TTS réel. Le mouvement d’écoute utilise le niveau STT séparé. Une fin audio efface son niveau si aucune autre action du même canal n’est encore en cours.

Les événements ne déduisent pas le sens d’un outil depuis son nom : les liaisons sont explicites. Un outil non lié utilise `think`.

```js
cephalon.animations.bindTools({
  'filesystem.read': 'read',
  'filesystem.write': 'write',
  'web.search': 'search',
  'agents.spawn': 'summon',
  'agents.message': 'contact'
}); // remplace toute la table
```

Pour brancher le transport fourni par le projet d’agent :

```js
const stream = new EventSource(agentEventsURL);
stream.onmessage = message => {
  try { cephalon.events.handle(JSON.parse(message.data)); }
  catch (error) { console.error('Événement Céphalon refusé', error); }
};
stream.onerror = () => {
  // Selon la politique de reconnexion du projet hôte, arrêter les présences périmées.
  cephalon.events.handle({ version: 1, type: 'reset' });
};
// À la fermeture de l’intégration : stream.close();
```

L’agent hôte gère l’authentification, les origines autorisées et la reconnexion de son propre transport. Aucun serveur WebSocket ou endpoint réseau n’est ajouté ici.

## Définir et partager une variante

```js
cephalon.animations.configure('review', {
  extends: 'read',
  label: 'Relire un document',
  tempo: 0.7,
  intensity: 0.8,
  focus: [-0.55, 0.15],
  duration: 8
});
cephalon.animations.configure('summon', { tempo: 0.8, tilt: 0.65 });
const configuration = cephalon.animations.export();
// Sauvegarder dans le dépôt de l’application d’intégration.
cephalon.animations.import(configuration);
```

Les comportements disponibles restent les douze comportements natifs ; un nouveau nom crée une variante déclarative de l’un d’eux. Une nouvelle chorégraphie nécessite d’ajouter un comportement dans `ActionChoreography.js`. Le JSON ne contient jamais de JavaScript exécutable.

| Paramètre | Valeurs |
| --- | --- |
| `tempo` | 0,25 à 2,5 |
| `intensity`, `travel`, `tilt`, `lean` | 0 à 2 |
| `pulse` | 0 à 2 ; 0 supprime les nouvelles pulsations physiques et décharges |
| `radiance` | 0 à 2 ; émission des arêtes, du noyau et des effets énergétiques |
| `focus` | Deux nombres entre −1 et 1 |
| `duration` | 0,3 à 120 secondes, utilisée par `play` |

L’import est validé avant de remplacer la bibliothèque active. Un fichier incorrect conserve les réglages précédents. `configure` modifie un seul set ; `import` repart des sets fournis puis applique la configuration. `reset(name)` rétablit un set natif ; `reset()` rétablit toute la bibliothèque et les liaisons. Les gestes courts de l’API historique `cue` et la mission restent disponibles.

## Réutiliser le contrôleur sans la page de démonstration

```js
import { AvatarAnimationController } from './packages/avatar/src/AvatarAnimationController.js';
import { AgentEventBridge } from './packages/avatar/src/AgentEventBridge.js';

const controller = new AvatarAnimationController({ demo: false });
const events = new AgentEventBridge(controller);
events.handle({ version: 1, type: 'tool.start', id: 'job-1', tool: 'read_file' });
// L’hôte appelle controller.update(deltaSeconds) depuis sa boucle.
```

`AnimationLibrary`, `ActionAnimations`, `ActionChoreography` et `AgentEventBridge` n’importent ni Three.js ni le DOM. `PresenceDirector` transforme leurs intentions en posture. `ContactLinks` et `AttentionField` assurent les représentations spatiales dans la scène.

L’avatar fournit la couche de présence et d’analyse audio. La reconnaissance STT, la génération TTS et l’exécution des agents restent à implémenter dans le compagnon et le runtime.

Pour essayer une voix réelle sans fournisseur TTS, douze clips originaux anglais et douze français sont générés hors ligne avec le modèle Ordis fourni. L’anglais est le défaut. `await cephalon.playVoice('en:summon')` ou `cephalon.playVoice('fr:summon')` lit le fichier local et anime le vrai RMS / les bandes audio. Une collection `official` contient quatre courts enregistrements du jeu avec leur provenance Wiki ; `cephalon.playVoice('official:glitch')` joue l’extrait de référence et sa réaction visuelle synchronisée. Les générations ne sont pas présentées comme des citations officielles.

`cephalon.voices.clips` décrit la collection courante ; `cephalon.voices.setCollection('en' | 'fr' | 'official')` change celle affichée. Sans préfixe, `playVoice` cherche dans la collection courante, puis dans les clips générés anglais. Ces aperçus utilisent l’état de parole et interrompent la démonstration en cours ; leur champ `animation` décrit le contexte de la réplique. La chaîne de génération et les fichiers sont décrits dans [`tooling/voice/README.md`](../tooling/voice/README.md). Ils ne constituent pas un moteur TTS à la demande.

Pour présenter les profils sans journal de mission : `cephalon.startShowcase()` et `cephalon.stopShowcase()`. La démo utilise les mêmes sets que les événements externes et un signal audio simulé. Une interaction manuelle ou un événement externe l’interrompt. La pause suspend sa progression ; les préférences de mouvement réduit restent appliquées.

La mission d’investigation utilise désormais sa propre narration anglaise via `MissionNarration.js`. Son démarrage requiert un appui pour activer Web Audio. Les clips sont décodés en buffers pour enchaîner les phases sans autre geste ; la pause reprend au même offset et l’arrêt annule aussi les lectures en attente. `controller.setSpeechActive(true)` permet d’activer la réactivité TTS tout en conservant un état de travail tel que `thinking` ; la mission le désactive à la fin de chaque intervention. L’audio réel reste séparé du microphone et ne détermine pas l’émotion. `cephalon.missionNarration` expose le lecteur de démonstration ; il ne constitue pas un service TTS à la demande.
