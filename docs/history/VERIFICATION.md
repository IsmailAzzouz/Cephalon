# Vérification — reconstruction du 7 novembre 2026

Le serveur reste actif dans `cephalon-preview.service`, lancé avec `npm run dev -- --host 0.0.0.0 --log-requests`. L’adresse LAN est `http://192.168.129.101:5173/`.

## Tests automatisés

La passe précédente avait validé **34 tests**. Ils couvrent le RMS PCM, les bandes de fréquences à plusieurs taux d’échantillonnage, la séparation microphone / sortie, les annulations audio et la propriété des pistes STT ; les temps d’attaque / relâchement ; les états et émotions ; le retour après glitch ; l’absence de fragmentation permanente ; le contrôle de mouvement et du zoom ; la géométrie fermée de l’hexaèdre ; l’horizontalité des trois couches d’ondes ; le service des fichiers ; et la mission d’essai. Cette suite n’a pas été relancée lors de la passe de gestuelle ; aucun test unitaire n’a été ajouté, conformément à la demande.

Le cristal repose sur huit coins partagés, douze arêtes et six faces. Les bords triangulés ont chacun deux voisins. Les normales et positions sont finies. Les ondes ne sont pas attachées au rig d’inclinaison du cristal.

## Navigateur

Chromium avec WebGL logiciel, cinq configurations : 390 × 844, 320 × 640, 844 × 390, 1440 × 900 et réduction des animations. Aucune erreur JavaScript / shader ni débordement horizontal détecté. Le render target est réellement HalfFloat et le support HDR est confirmé.

Le parcours vérifie les états, le toucher et la rotation, l’horizontalité après rotation, le retour complet après glitch, les émotions, les curseurs optiques, la désactivation des post-effets, l’isolation des couches, la réinitialisation, la pause, l’immersion et le clavier.

Un fichier WAV multibande est lu par Web Audio : le niveau de sortie et les bandes sont non nuls, le niveau microphone reste nul, et le signal simulé est désactivé. Un microphone de test Chromium sur localhost fournit séparément un niveau d’entrée ; aucun niveau TTS n’est inventé. Les pistes du microphone détenu par l’atelier sont arrêtées correctement. Un flux externe reste la propriété de son appelant.

Les résultats détaillés sont dans `artifacts/rebuild/browser-checks.json`. Les captures de construction et des écrans mobile / ordinateur sont inspectées. Un pic de surexposition dans le verre pendant un glitch a été corrigé : la distance optique est bornée et le verre reste sous le seuil d’extraction du bloom ; les émissions fortes appartiennent aux arêtes, aux ondes et au noyau.

## Mission d’essai de l’agent

La séquence de 29,6 secondes est vérifiée de bout en bout dans Chromium avec émulation tactile : lancement automatique, pause réelle du chronomètre, recherche progressive, rapport final fondé sur les résultats, journal des preuves, rejeu et annulation. Les configurations 320 × 640, 844 × 390, 1440 × 900 et mouvement réduit sont aussi vérifiées, sans erreur JavaScript détectée. Résultats dans `artifacts/mission/checks.json`.

Le scénario examine 12 transmissions fictives, recoupe TR-004 et TR-008 et analyse 200 paquets ; le pic d’énergie de +34 % et l’intégrité de 98 % sont calculés, puis incorporés au rapport. Un test de recherche infructueuse vérifie qu’aucune découverte ou conclusion n’est inventée. Les tests couvrent également les doublons de preuve, la pause, l’arrêt, le rejeu et la séparation entre tâche, parole et émotion.

## Passe de présence et gestuelle

La mission entière a été enregistrée dans Chromium en vue téléphone 390 × 844, avec neuf captures de posture et sans erreur JavaScript ou shader remontée. Les captures de lecture gauche, de lecture droite et de rapport ont été inspectées visuellement : l’orientation du corps change nettement, ses faces révèlent des profondeurs différentes et les anneaux conservent leur ellipse horizontale.

Le suivi de la séquence observe une orientation latérale de −32,5° à +32,2°, une inclinaison verticale de −16,1° à +13,4° et un rapprochement allant jusqu’à 0,23 unité. Ces mesures documentent le mouvement exécuté ; l’appréciation artistique repose sur les vues rendues. La recherche suit les enregistrements effectivement parcourus, la comparaison alterne entre les sources et la parole revient vers l’Opérateur. La rotation manuelle conserve la priorité temporaire.

Film : `artifacts/presence/ordis-live.webm`. Poses et relevés : `artifacts/presence/`. Vérification de syntaxe des modules et export statique effectués ; aucun test unitaire exécuté pour cette passe.

La lecture est également inspectée à 1440 × 900 (`10-desktop-reading.png`), sans erreur JavaScript ni débordement horizontal. La pause conserve exactement la posture pendant l’observation. Le service est actif et l’URL LAN renvoie HTTP 200.

## Bibliothèque de sets et événements d’agent

Douze profils déclaratifs, leurs chorégraphies et les liaisons d’outils sont ajoutés. Le parcours navigateur observe dix sets à 390 × 844 et inspecte écriture, summon, atelier mobile, atelier ordinateur et cadrage étroit à 320 × 640. Les vues d’ordinateur sont à 1440 × 900. Les anneaux observés conservent leur rotation horizontale pendant les changements de posture. La démonstration de contacts ne crée pas de sous-agent réel.

Le cycle d’événements corrélés est exécuté dans la page : un outil de lecture commence, un appel de sous-agent prend la priorité, puis la parole l’interrompt ; terminer l’ancien outil conserve la parole ; terminer la parole rétablit la liaison ; terminer le sous-agent retrouve le repos. La fin d’une ancienne session TTS conserve le niveau d’une autre session en cours, et la fin de la dernière remet ce niveau à zéro.

Les contrôles de l’atelier importent le fichier exemple, exportent un JSON effectivement téléchargé, créent une variante et la prévisualisent en fermant le panneau. Un réglage de vitesse est conservé après rechargement. Un import incorrect est refusé sans modifier la bibliothèque. En mouvement réduit, la posture reste figée par défaut. Les parcours ne remontent aucune erreur JavaScript. Relevés, captures et film : `artifacts/animation-sets/`.

Les nouveaux modules passent la vérification de syntaxe et l’export statique. Aucun test unitaire n’a été ajouté ni exécuté pendant cette passe. Le transport externe et les vrais services STT / TTS ne sont pas connectés : le contrat et les exemples sont dans `docs/AGENT_INTEGRATION.md`.

## Résonance et pulsation du cristal

Une démo complète de 23 secondes est enregistrée en vue mobile 390 × 844. Elle atteint sa fin sans erreur JavaScript ou shader remontée. Les postures relevées pendant cette démo montrent une contraction latérale jusqu’à 0,921 et une expansion jusqu’à 1,066 ; la capture d’inspection de décharge sur ordinateur atteint 1,085. Ces facteurs concernent le cube ; les anneaux ne reçoivent pas cette déformation.

Les vues de charge, décharge et rémanence sont inspectées, ainsi que le summon à 1440 × 900. Le volume reste cohérent, les fronts extérieurs sont horizontaux, le noyau concentre puis libère sa lumière, et les rémanences disparaissent. La pause fige le score énergétique. Les paramètres `pulse` et `radiance` sont présents dans l’atelier. Un ancien fichier v1 s’importe avec ces deux paramètres à 1 ; `pulse: 0` ramène le volume à une échelle neutre après extinction des effets précédents.

Film et relevés : `artifacts/resonance/energy-showcase.webm`, `showcase-review.json` et `controls-review.json`. Les images numérotées sont les études intermédiaires de matière ; les images `*-live.png` et `summon-desktop.png` présentent le réglage d’amplitude final. Syntaxe et export statique vérifiés. Aucun test unitaire ajouté ni exécuté.

## Clips Ordis avec le modèle fourni

L’archive `ordis_robotic_voice_warframe_13875.zip`, fournie à la racine du dépôt, est extraite dans `voice/models/ordis/`. Le checkpoint et l’index sont identifiés ; leurs empreintes sont enregistrées dans `voice/model-provenance.json`. Le checkpoint annonce RVC v2, 40 kHz, F0 actif et 1000 epochs. La chaîne CPU isolée utilise Piper pour la parole française source, puis ce modèle et son index pour convertir les douze répliques.

Le lot généré contient douze WAV et douze MP3, pour 47,48 secondes de parole. Les WAV ont des valeurs finies, un niveau non nul et des crêtes inférieures à 1. Les MP3 sont décodés pour inspecter leurs métadonnées et niveaux. `public/audio/ordis/manifest.json` conserve textes, durées, paramètres de conversion et empreintes. Le ZIP de livraison contient les clips et leurs métadonnées, sans les poids des modèles.

Le parcours Chromium à 390 × 844 charge les douze choix, télécharge le MP3 d’invocation et observe une lecture réelle. Le niveau vocal atteint 0,939 ; le canal microphone reste nul. La simulation est désactivée, le panneau se ferme et les ondes suivent la sortie. L’arrêt supprime l’élément et l’analyseur, ramène l’état au repos et le signal à zéro. Un WAV importé via le sélecteur de fichiers reste lisible après la refonte du lecteur. Les vues à 390 × 844 et 320 × 640 sont inspectées. Aucune erreur JavaScript remontée.

Une transcription automatique de trois extraits reconnaît une grande partie du contenu, avec des erreurs de mots ; la source Piper produit aussi certaines de ces erreurs dans le même transcripteur. Ce relevé est indicatif et ne constitue ni une écoute humaine ni une validation de ressemblance à Ordis. Les fichiers restent à apprécier à l’écoute par l’utilisateur. Résultats et captures : `artifacts/voice/`.

L’export statique contient uniquement les clips nécessaires à leur lecture ; Python et les modèles restent locaux. Le serveur est redémarré pour servir `/audio/` avec les types audio corrects. Aucun test unitaire ajouté ni exécuté.

## Anglais et références du jeu

La page Ordis/Quotes du WARFRAME Wiki est consultée. Quatre courts enregistrements sont récupérés par leurs liens audio, dont le fichier `DIdle080Ordis_en.ogg` fourni en référence, disponible sur le wiki actuel. Leurs OGG et transcodages MP3 représentent 11,66 secondes. Le manifeste conserve la source, le nom original, la durée, le SHA-256 et le crédit Digital Extremes / Warframe.

Douze textes originaux pour les actions sont générés en anglais avec Piper Ryan high puis le même modèle Ordis RVC v2 et son index : 34,7 secondes, WAV et MP3, sans écraser le lot français. Le ZIP anglais contient uniquement ces créations et leur provenance ; les extraits du jeu constituent un catalogue distinct. Une transcription automatique indicative de trois répliques anglaises est conservée, avec ses erreurs, sans revendiquer une écoute humaine ni une ressemblance validée.

Le parcours navigateur confirme l’anglais par défaut et les collections 12 anglais / 4 extraits du jeu / 12 français. La lecture anglaise active le vrai RMS (0,664 observé), désactive la simulation et laisse le microphone à zéro. L’extrait de référence déclenche sa réaction visuelle vers 1,2 seconde, repère approximatif obtenu par alignement automatique. L’événement se déclenche une fois ; la réaction est observée dans le rendu. En mouvement réduit, le passage audio reste lisible et le glitch reste à zéro. L’arrêt termine correctement la lecture et ramène l’état au repos. La lecture française reste accessible par son identifiant explicite. Aucune erreur navigateur remontée.

Les vues de la collection du jeu sont inspectées à 390 × 844 et 320 × 640. Les sources sont visibles dans l’atelier. Résultats : `artifacts/voice/english-browser-review.json`, `english-transcription.json` et `official-cue-timing.json`. Aucun test unitaire ajouté ni exécuté.

## Mission narrée en anglais

Dix clips originaux dédiés sont générés avec le modèle Ordis fourni : sept interventions de mission et trois réponses prudentes. Le rapport principal dure 14,1 secondes et annonce les résultats du scénario : Relay E-17, Europa, +34 % et 98 %. La durée des phases est adaptée aux buffers décodés ; une barrière de fin de lecture empêche une transition de couper une intervention. Les annonces spécifiques sont sélectionnées uniquement pour le résultat correspondant.

Le parcours complet à 390 × 844 observe les sept étapes et les sept clips, jusqu’au rapport terminé, sans erreur JavaScript. Avant l’appui de démarrage, il n’y a ni contexte audio ni sortie active. Un seul appui suffit pour précharger, décoder et jouer la mission. Le niveau vocal réel atteint 0,857 dans ce relevé ; le signal microphone reste nul à la précision numérique. Le mouvement de travail et l’activation vocale sont distincts : la recherche peut parler tout en lisant. Le rapport et les messages de mission sont en anglais.

Une pause pendant la recherche conserve exactement le chronomètre de mission et la position audio, puis la mission reprend et se termine. Un rejeu suivi d’un arrêt coupe la sortie, l’activation vocale et toute attente de narration. À 320 × 640 avec réduction du mouvement, l’audio joue tandis que le cube reste à son échelle neutre ; le microphone est à zéro. L’absence de source choisit la réplique `not-found`. Des données différentes choisissent `report-generic`, sans réciter les mesures du scénario. L’arrêt demandé pendant la préparation ne provoque pas de démarrage tardif.

Résultats et captures : `artifacts/voiced-mission/browser-review.json`, `edge-review.json`, vues de préparation, recherche parlée, rapport et petit écran. `mission-visual.webm` est une capture du rendu navigateur, sans piste sonore ; la sortie audio réelle est contrôlée par les analyseurs Web Audio et les relevés. Syntaxe et build statique passent. Le service LAN est actif, HTTP 200. Aucun test unitaire ajouté ni exécuté.

## Limites précises

Les quatre images de référence et l’image comparative annoncées dans le message ne sont pas jointes. La reconstruction a suivi le cahier des charges et un GIF officiel accessible, sans prétendre comparer les quatre images absentes.

Les tests tactiles utilisent une émulation navigateur ; la nouvelle version reste à apprécier sur le téléphone réel et sur Safari. Le microphone sur l’adresse LAN en HTTP n’est pas disponible : HTTPS ou localhost est nécessaire. L’atelier l’indique ; les fichiers audio et signaux externes fonctionnent sur HTTP.

Le projet prépare l’intégration TTS / STT et l’analyse audio. Les clips livrés disposent d’un générateur hors ligne ; le site ne contient ni moteur de reconnaissance de texte ni service TTS à la demande.

État : `systemctl --user status cephalon-preview.service`. Journaux : `journalctl --user -u cephalon-preview.service`.
