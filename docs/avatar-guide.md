# Ordis — Céphalon

Avatar Three.js : cristal holographique cohérent, ondes horizontales, noyau volumétrique stylisé, bloom HDR et expressivité sans visage.

Ce guide décrit l’atelier navigateur existant. Le produit cible est présenté
dans le [README principal](../README.md). Les agents et le compagnon résident
restent à implémenter.

## Lancer sur le réseau local

Node.js 20+ suffit. Three.js et les polices sont inclus.

```bash
cd /home/nemesis/src/cephalon
npm run dev -- --host 0.0.0.0
```

Sur le téléphone connecté au même réseau, ouvrir **http://192.168.129.101:5173/** (ou l’adresse affichée par le serveur). Le service utilisateur `cephalon-preview.service` conserve le serveur actif :

```bash
systemctl --user status cephalon-preview.service
journalctl --user -u cephalon-preview.service -f
systemctl --user stop cephalon-preview.service
```

Ne pas lancer une seconde instance sur le même port. Pour choisir un autre port : `npm run dev -- --host 0.0.0.0 --port 5174`.

## Mission d’essai de l’agent

Ouvrir **http://192.168.129.101:5173/?mission=1**, puis appuyer sur **Start mission**. Cet appui autorise la voix dans le navigateur du téléphone ; aucune piste ne démarre automatiquement au chargement.

En environ 40 secondes, Ordis reçoit une demande de l’Opérateur, prépare un plan, cherche dans les transmissions, repère une source, analyse ses paquets, recoupe ses observations et présente son rapport. **La mission et sa narration sont en anglais uniquement.** Il accuse réception par une inclinaison, regarde de côté pour réfléchir, parcourt les transmissions de gauche à droite et de haut en bas, se rapproche du résultat, compare deux sources, puis revient vers l’Opérateur. Des accents de posture accompagnent les phrases.

Chaque étape possède une réplique dédiée, générée avec le modèle Ordis fourni. Les ondes et le noyau suivent le **vrai signal audio** ; Ordis conserve ses gestes de travail pendant ses commentaires. Le rapport annonce la source et les valeurs calculées du scénario. Les phases attendent la fin de leur réplique, sans couper le rapport. Des silences laissent place au travail entre les interventions.

Le scénario utilise **12 transmissions locales fictives**, clairement indiquées dans l’interface. Le filtrage par fréquence et signature, l’agrégation des paquets, les mesures et la vérification des observations sont exécutés dans le navigateur. Le rapport est généré à partir des résultats ; il ne provient pas d’une recherche Internet ou d’un modèle distant. Aucune recommandation n’est exécutée sur le PC ou le réseau.

La mission dispose d’un journal, d’une pause, d’un arrêt et d’un bouton de reprise après pause ou de rejeu après la fin. **La pause suspend la voix au même endroit**, puis la reprend ; l’arrêt coupe aussi l’audio. Le masquage de l’onglet met la mission en pause. Les changements manuels d’état ou de source interrompent la séquence. Le toucher du cristal permet aussi de l’interrompre pour revenir à l’écoute. Le glissement continue simplement à orienter le cristal.

```js
cephalon.startMission();
cephalon.mission.setPaused(true);
cephalon.mission.setPaused(false);
cephalon.mission.snapshot();
cephalon.stopMission();
```

Le scénario et ses données sont dans `examples/signal-mission/src/SignalScenario.js`. L’ordonnanceur `AgentSequence.js` est indépendant du rendu et du DOM ; sa vue s’adapte au téléphone et à l’ordinateur. `MissionNarration.js` gère les buffers audio, leur pause et leur reprise. Les annonces chiffrées sont réservées aux résultats correspondants ; une autre recherche reçoit des répliques prudentes, sans inventer les données du scénario. Les captures et contrôles de la version parlée sont dans `artifacts/voiced-mission/`.

## Explorer

Le bouton **Animations** ouvre la bibliothèque de douze sets : repos, lecture, écriture, écoute, parole, réflexion, recherche, analyse, comparaison, contact, appel de sous-agents et rapport. **Jouer le set** ferme l’atelier pour observer le mouvement. Chaque set peut être réglé, dupliqué et exporté en JSON ; les noms d’outils se lient aux sets depuis le même atelier. Les réglages sont conservés sur cet appareil.

**Voir les enchaînements**, ou **http://192.168.129.101:5173/?showcase=1**, présente une séquence visuelle d’environ 23 secondes : écoute, réflexion, écriture, appel de sous-agents, analyse et rapport. Aucun texte de mission ne recouvre la projection. Le signal vocal reste simulé, sans son généré.

Le cube respire et se contracte selon l’action. Un score énergétique commun synchronise sa déformation, les fissures, le noyau, les caustiques sur les faces, les rémanences d’arêtes et les ondes de décharge horizontales. Le summon concentre l’énergie avant deux décharges ; les liaisons montrent des paquets en circulation. Les paramètres **Pulsation du cristal** et **Rayonnement énergétique** se règlent indépendamment pour chaque set. Les anciens fichiers JSON v1 restent importables.

La couche d’intégration reçoit des événements JSON v1, sans dépendance à un framework d’agent. Elle suit les débuts et fins des outils, la parole, l’écoute et les sous-agents, avec identifiants corrélés et reprise de l’action sous-jacente après interruption. Le contrat, les exemples et les limites sont dans **[docs/AGENT_INTEGRATION.md](AGENT_INTEGRATION.md)**.

```js
const action = cephalon.actions.start('write', { id: 'edit-42' });
// À la fin de l’outil réel :
cephalon.actions.finish(action);

cephalon.events.handle({ version: 1, type: 'subagent.start', id: 'researcher-1' });
cephalon.events.handle({ version: 1, type: 'subagent.end', id: 'researcher-1' });
```

Repos, Écoute, Réflexion et Parole utilisent par défaut un **signal audio simulé**, indiqué sous les commandes. Les émotions se choisissent dans l’atelier optique. L’icône éclair déclenche une rupture brève.

Glisser fait tourner le cristal ; pincer ou utiliser la molette règle le zoom ; double appui / double clic ou touche Début recentre. Les ondes restent horizontales lorsque le cristal tourne. Espace bascule entre repos et parole ; les flèches orientent le cristal. Échap ferme l’atelier ou quitte l’immersion.

L’atelier s’ouvre avec l’icône de réglages, ou directement via **http://192.168.129.101:5173/?debug**. Il permet de régler la matière, le Fresnel, les arêtes, le bloom, la dispersion, le noyau, les ondes et les réactions ; d’isoler chaque couche ; de désactiver les post-effets ; et de consulter les sept étapes de reconstruction.

## Audio réel

L’anglais est la collection vocale par défaut : **douze répliques originales générées avec le modèle RVC fourni**. L’atelier distingue les collections English / Français générées et **quatre courts enregistrements du jeu provenant du WARFRAME Wiki**. Les répliques créées pour l’agent ne sont pas présentées comme des citations officielles.

Ouvrir **http://192.168.129.101:5173/?voice=en** pour les répliques de l’agent, ou **http://192.168.129.101:5173/?voice=official** pour les extraits du jeu, dont la rupture de personnalité fournie en référence. Choisir une réplique puis **Écouter avec l’avatar**. Les ondes suivent le vrai signal audio ; une brève réaction glitch accompagne le passage correspondant de l’extrait de référence. Le français reste accessible dans le sélecteur de collection. Les MP3 sont téléchargeables et les sources des enregistrements du jeu sont indiquées.

Le [lot anglais WAV / MP3](http://192.168.129.101:5173/audio/ordis-en/ordis-en-pack.zip), le [lot français](http://192.168.129.101:5173/audio/ordis/ordis-fr-pack.zip) et les instructions de régénération sont décrits dans [tooling/voice/README.md](../tooling/voice/README.md).

Dans l’atelier, charger un MP3, WAV ou autre fichier compatible avec le navigateur. Le fichier est lu et analysé sur l’appareil ; il n’est pas envoyé au serveur. Le RMS et trois bandes de fréquences pilotent l’état de parole, avec attaque de 50 ms et relâchement de 170 ms.

Le microphone utilise une analyse distincte et n’est jamais connecté aux haut-parleurs. Son accès nécessite **HTTPS ou localhost**. Sur l’adresse LAN en HTTP, la commande est désactivée avec une explication ; un fichier audio ou des niveaux fournis par l’application restent utilisables.

Le projet prépare les événements TTS / STT. Les clips livrés sont générés hors ligne avec `tooling/voice/generate.py` ; le site n’implémente ni reconnaissance de texte ni service de génération vocale à la demande.

## API pour le système conversationnel

Le contrôleur est indépendant du rendu, dans `packages/avatar/src/AvatarAnimationController.js`. L’instance de démonstration expose `window.cephalon` :

```js
cephalon.setState('speaking');
cephalon.setEmotion('happy', 0.8);
cephalon.setSignals({
  outputVoiceLevel: 0.6,
  inputMicLevel: 0,
  frequencyBands: [0.4, 0.65, 0.2], // basses, médiums, aigus
});

// Pour écouter : utiliser un signal microphone distinct.
cephalon.setState('listening');
cephalon.setSignals({
  inputMicLevel: 0.35,
  inputFrequencyBands: [0.2, 0.3, 0.1],
  outputVoiceLevel: 0
});

cephalon.triggerGlitch(0.8, 0.26);
cephalon.useDemo();
```

Les gestes peuvent aussi suivre les événements d’un agent externe. `focus` indique une direction d’attention normalisée, avec X positif vers la droite et Y positif vers le haut. Les rotations et déplacements sont amortis ; le noyau précède légèrement le corps.

```js
cephalon.setState('thinking');
cephalon.cue('tool-call', {focus: [-0.7, 0.25], duration: 0.5, tool: 'Recherche'});
// À l’arrivée d’une donnée :
cephalon.cue('read', {focus: [-0.6, -0.1], duration: 0.6, record: 'source-004'});
// Pour comparer les résultats :
cephalon.cue('compare', {duration: 3});
// Au début du compte rendu :
cephalon.setState('speaking');
cephalon.cue('report', {duration: 2});
```

Gestes disponibles : `acknowledge, consider, tool-call, read, inspect, compare, found, report, settle`. Un geste ne change pas l’état ni l’émotion. Les projections de données restent secondaires et disparaissent quand il revient parler à l’Opérateur. Le glissement au doigt prend temporairement la priorité sur les mouvements autonomes.

États : `idle, listening, thinking, speaking, glitch`. Émotions : `neutral, happy, curious, concerned, sad, angry, surprised`. Les niveaux et intensités sont normalisés entre 0 et 1. Le volume ne détermine jamais l’émotion.

Les propriétés `state, emotion, emotionIntensity, outputVoiceLevel, inputMicLevel, frequencyBands, glitchIntensity` sont aussi exposées ; `time` est consultable. `setSignals` désactive la simulation. Les paramètres optiques sont accessibles par `cephalon.config`.

Pour analyser une sortie Web Audio déjà en cours :

```js
await cephalon.connectOutput(ttsGainNode); // analyse seule, sans doubler le son
// audible:true route aussi l’analyseur vers la destination si nécessaire.
await cephalon.connectMicrophone(sttMediaStream);
```

Un flux microphone fourni par l’appelant reste sa propriété : `stopAudio()` déconnecte son analyseur sans arrêter les pistes STT. Le microphone demandé depuis l’atelier est arrêté à la fermeture de sa capture.

## Architecture

`packages/avatar/src/` contient la composition, le contrôleur, l’interaction, le cristal, les fractures, le noyau, les filaments, les trois couches d’ondes et le pipeline optique. Le rig de position est séparé du rig d’orientation du cristal.

`PresenceDirector.js` traduit les états et les gestes sémantiques en directions d’attention et postures amorties. `AttentionField.js` affiche les petites projections consultées pendant le travail. Le rendu ne dépend pas du texte affiché dans le journal. La séquence filmée et ses poses sont dans `artifacts/presence/`.

`AnimationLibrary.js` contient les profils déclaratifs et les liaisons d’outils. `ActionAnimations.js` suit leur cycle de vie, `ActionChoreography.js` décrit les comportements et `packages/avatar/src/AgentEventBridge.js` traduit les événements externes. Ces modules ne dépendent ni du DOM ni de Three.js. Le contrat TypeScript est dans `packages/contracts/src/avatar-events.d.ts`. `ContactLinks.js` affiche les points de liaison temporaires ; il ne crée pas de vrais sous-agents.

`EnergyDynamics.js` produit les impulsions et la déformation amortie. `CrystalResonance.js` dessine les caustiques et les échos cohérents du volume ; `EnergyWake.js` rend les fronts d’onde XZ et les traces d’ions. Le rig des anneaux reste séparé de la déformation du cube.

Le bloom utilise un render target HalfFloat, une extraction des parties émissives et trois niveaux de flou. La dispersion s’applique aux hautes lumières. Si le navigateur ne peut pas rendre en HDR, l’atelier indique le rendu de secours.

## Vérifier et exporter

```bash
npm test
npm run build
npm run preview -- --host 0.0.0.0
```

`dist/` est un export statique autonome à servir en HTTP. Les captures des sept étapes et des contrôles navigateur sont dans `artifacts/rebuild/`. `src/review.html?stage=1` à `stage=7` permet de consulter les étapes.

Les préférences de réduction des animations suspendent les mouvements par défaut et suppriment les sursauts et flashes. La pause suspend les mouvements autonomes ; les signaux et changements d’état restent exploitables. Le rendu est suspendu quand l’onglet est masqué.

## Références et licences

Les quatre images prioritaires et l’image comparative annoncées dans le cahier des charges ne sont pas jointes. La reconstruction suit ce cahier des charges et le GIF de [la publication officielle d’Ordis](https://forums.warframe.com/topic/1202015-cephalon-joke-a-thon-contest-winners-announced/), inspecté pendant le travail. La compilation vidéo précédemment identifiée n’a pas été visionnée.

Géométrie originale, étude de fan, sans modèle extrait du jeu. Three.js **r182**, licence MIT dans `public/vendor/three/LICENSE`. Barlow / Barlow Condensed, licence OFL dans `public/fonts/OFL.txt`.
