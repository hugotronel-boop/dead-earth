# DEAD EARTH V1.4 — Errance libre des zombies

Cette version se base sur la V1.3 et ne modifie que le moteur de déplacement des zombies.

## Changements

- Chaque cellule du quadrillage mondial conserve sa surface d'environ **20 km²** et sa population de **12 à 38 infectés**.
- Chaque infecté tire des destinations aléatoires **dans toute sa cellule**, sans être limité à un rayon autour de son point de départ.
- Les mouvements sont fluides, progressifs et visibles sur la carte. Les vitesses ont été légèrement rehaussées pour améliorer le ressenti du jeu.
- Les positions, destinations et états aléatoires des zombies consultés sont sauvegardés localement. Au retour dans un secteur, les positions sont recalculées d'après le temps écoulé (jusqu'à 48 h d'un coup) : le jeu n'a pas besoin de rester ouvert.
- Les zombies restent dans leur propre cellule et ne peuvent ni traverser ni apparaître dans une zone SAFE ou dans le refuge.
- Chaque élimination conserve son compte à rebours indépendant de **20 heures** avant le retour d'un remplaçant.
- Le cache limite l'utilisation mémoire / stockage afin que la carte reste utilisable sur mobile.

## Installation sur GitHub Pages

Si tu utilises déjà la version **un seul fichier**, remplace **uniquement `index.html`** à la racine du dépôt `dead-earth`, puis valide `Commit changes`. La sauvegarde existante est conservée dans le stockage local du navigateur, tant que ce stockage n'est pas effacé.

## Limites techniques

Le déplacement est calculé **au moment où les secteurs sont chargés** et non par un serveur qui fait tourner le jeu 24 h/24. Les zombies non consultés évoluent lors de leur prochain affichage. Le monde est encore solo, dépend de l'horloge du téléphone et n'est pas synchronisé entre les joueurs.

Pour vérifier le déplacement, observe les zombies en zoomant sur une zone où des infectés sont visibles, puis reviens après quelques minutes : leur position aura changé.
