# DEAD EARTH — V1.3 : écosystème de zombies

## Nouveautés

- La carte du monde est divisée en cases géographiques d'environ **20 km²** chacune, soit des carrés d'environ **4,47 km de côté** autour des latitudes françaises. Les limites sont légèrement approximatives sur le globe.
- Chaque case contient une population **déterministe mais aléatoire de 12 à 38 zombies**. Le même joueur retrouve le même nombre dans une même case.
- Chaque zombie peut choisir des destinations **partout dans sa propre case** et y marche librement. Il ne peut pas franchir une limite de case.
- Chaque zombie tué disparaît de la carte et déclenche un délai **individuel de 20 heures réelles**. Un remplaçant ne peut apparaître qu'après la fin de ce délai, à une nouvelle position dans la même case.
- Zombies interdits dans les **zones SAFE** et dans le refuge : interdiction à l'apparition, lors du déplacement et lors de l'agrandissement d'une protection.
- Le blocage d'une construction SAFE vérifie la **position actuelle** des zombies dans le futur périmètre, pas un point d'apparition ancien.
- Le menu du village affiche la population et les retours prévus dans la case actuellement regardée.
- La carte reste rapide : seule la population des cases visibles et nécessaires aux vérifications est instanciée.

## Fonctionnement conservé

- GPS réel pour combattre à 20 mètres maximum d'un zombie et fouiller à 10 mètres maximum d'un lieu réel.
- Zones SAFE : présence du joueur à 35 mètres du centre, matériaux nécessaires, diamètre de 100 à 1 000 mètres selon le niveau.
- Refuge au domicile, inventaire, atelier, missions, fabrication, sauvegarde locale.
- Même interface pixel art, en un seul fichier HTML.

## Installation GitHub Pages

Remplacer **uniquement le fichier `index.html`** à la racine de ton dépôt `dead-earth` par le fichier de ce dossier, puis faire **Commit changes**. Il est autonome pour les éléments du jeu, mais les données de commerces et de rues nécessitent une connexion Internet.

## Limites actuelles

- Ceci est une **simulation locale solo** : les morts, le délai de retour et les zones SAFE sont sauvegardés **sur cet appareil**, pas synchronisés entre joueurs.
- Les zombies se déplacent quand leur case est chargée dans le jeu ; les compteurs de réapparition, eux, avancent même quand le jeu est fermé.
- Les horaires reposent sur l'horloge de l'appareil. Un serveur sera nécessaire plus tard pour empêcher la triche, assurer la même population à tous les joueurs et gérer un monde partagé.
- Pour des raisons de sécurité, aucune action du jeu ne doit exiger de courir, d'entrer dans des propriétés privées ou de regarder le téléphone en traversant une route.
