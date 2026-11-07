# Céphalon

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Three.js r182 et JavaScript natif, serveur HTTP Node.js 20+. Bibliothèque et polices servies localement, sans installation de dépendances pour exécuter le projet.

## Users
L’utilisateur observe et manipule l’avatar sur son téléphone connecté au réseau local du PC.

## Product Purpose
Représenter une intelligence lumineuse dans un cristal holographique endommagé, inspiré d’Ordis dans Warframe.

## Capabilities and Constraints
Le cahier des charges du 7 novembre 2026 remplace les anciens choix de fragmentation, d’orientation des ondes et d’absence d’audio. Un hexaèdre cohérent remplace les plaques séparées. La fragmentation est une réaction temporaire.

Les trois couches d’ondes sont horizontales en XZ, indépendantes de la rotation du cristal. Le contrôleur expose des états, des émotions et des signaux microphone / sortie audio séparés. Un signal simulé est disponible pour la démonstration, clairement indiqué.

Le rendu utilise du verre stylisé, des fissures, un noyau à intégration volumétrique, des arêtes émissives, un pipeline HDR avec bloom sélectif et une dispersion chromatique locale. Un atelier optique permet d’isoler les couches et de régler leurs paramètres.

Une mission d’essai d’environ 40 secondes illustre le comportement d’un agent : réception, réflexion, recherche locale, découverte, analyse, vérification et rapport à l’Opérateur. Sa voix et son texte sont en anglais uniquement. Des répliques générées avec le modèle fourni sont liées aux étapes, et le rapport annonce les résultats correspondants. Les gestes de travail restent actifs pendant les commentaires ; les ondes utilisent le vrai signal vocal. La pause suspend la narration et l’arrêt la coupe. Les données sont fictives et indiquées comme telles ; les opérations de filtrage et d’analyse sont réellement exécutées dans le navigateur. Aucune recherche Internet, appel de modèle distant ni action sur l’Orbiteur / le PC n’est effectué par ce scénario.

Le microphone du navigateur nécessite un contexte sécurisé (HTTPS ou localhost). Un fichier audio local, un AudioNode ou des niveaux fournis par le système conversationnel permettent de piloter la sortie sans microphone.

L’anglais est la langue vocale par défaut. Douze répliques originales anglaises sont générées hors ligne via Piper puis converties avec le modèle Ordis RVC v2 fourni par l’utilisateur ; les douze françaises restent accessibles. Quatre courts enregistrements du jeu, sourcés depuis le WARFRAME Wiki, constituent une collection distincte. L’atelier précise l’origine, permet la lecture avec le vrai signal audio et le téléchargement des MP3. Les modèles et Python restent hors du build frontend. Cette bibliothèque de démonstration est distincte d’un service STT / TTS à la demande.

Le projet doit pouvoir être réutilisé par un agent généraliste externe et préparé pour une future ouverture du code. Une bibliothèque de sets d’animation déclaratifs associe lecture, écriture, écoute, parole, réflexion, recherche, analyse, comparaison, contact, summon et rapport à des outils configurables. Les événements JSON versionnés suivent les actions par identifiant, permettent leur superposition et distinguent STT, TTS et présence des sous-agents. Le transport et les véritables agents appartiennent au projet d’intégration. L’atelier permet la prévisualisation, la création de variantes et l’import / export JSON sans modifier le rendu.

Le volume cristallin pulse selon l’action : concentration et détente pendant le summon, respiration de réflexion, accents d’écriture et de présentation. Un score énergétique synchronise les faces, les fissures, le noyau, les rémanences, les ondes XZ et les liaisons. Pulsation et rayonnement restent réglables par set. Une présentation de 23 secondes expose les enchaînements sans panneau de mission ; elle utilise uniquement le signal audio simulé.

## Brand Commitments
Référence à Ordis / Warframe. Géométrie originale, sans extraction d’assets du jeu. Les quatre images prioritaires et la cinquième image comparative décrites dans le dernier message ne sont pas jointes ; le travail utilise le cahier des charges et une référence animée officielle accessible.

## Accessibility & Inclusion
Commandes en français, navigation au clavier, cibles tactiles de 44 px et prise en compte de la réduction des animations. Les sursauts et les flashes de surprise sont supprimés en mouvement réduit.
