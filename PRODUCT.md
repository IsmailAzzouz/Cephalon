# Céphalon

## Produit

Compagnon de bureau résident pour un Opérateur. L’appel « Hey Ordis » ou une
activation manuelle fait apparaître Ordis au-dessus de l’application en cours.
L’Opérateur peut lui parler, lui confier du travail, demander son avancement,
l’interrompre et le masquer sans perdre la tâche en cours.

## Deux agents principaux

Ordis porte la personnalité et la conversation avec l’Opérateur. Le cerveau
possède le plan et l’exécution du travail. Il délègue des missions délimitées à
des spécialistes, dont computer use, recherche ou code. Les résultats reviennent
au cerveau ; Ordis les présente et relaie les demandes de clarification.

## Présence

L’hôte du compagnon gère l’activation, les flux audio, les écrans, la visibilité
et la connexion au runtime. La veille continue quand le rendu est masqué ou
suspendu. La détection d’activation ne dépend pas d’un appel au modèle.
Visibilité, conversation, parole et tâche ont des cycles de vie indépendants.

L’Opérateur contrôle l’écoute et peut la désactiver. L’état du microphone et le
mode d’activation doivent être compréhensibles dans les réglages et la présence.

## Identité visuelle

Ordis est représenté par un cristal holographique inspiré du personnage de
Warframe : volume cohérent, noyau lumineux, ondes horizontales, expressivité sans
visage. Les événements sémantiques guident la posture. Le signal audio réel guide
les ondes ; le volume ne détermine pas l’émotion. Les préférences de réduction
du mouvement restent prises en compte.

## État de réalisation

Disponibles : avatar Three.js / JavaScript, contrôleur, animation, événements
v1, analyse audio navigateur, atelier visuel, clips vocaux hors ligne et mission
fictive locale. L’atelier utilise un serveur HTTP Node.js 20+ et des ressources locales.

À construire : application native résidente, activation vocale, surcouche de
bureau, STT / TTS à la demande, agents et orchestration, outils et persistance.
La coque de bureau, les fournisseurs et le premier environnement graphique
ciblé restent à choisir. La prise en charge des autres systèmes n’est pas acquise.

Les enregistrements du jeu et les répliques générées conservent leurs collections
et provenances distinctes. Les données de mission sont explicitement fictives.
