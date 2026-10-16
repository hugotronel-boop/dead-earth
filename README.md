# DEAD EARTH — V2.1 LIGHT | Constructions de survie

## Mise à jour

Cette version repart de **DEAD EARTH V2.0 LIGHT** (sans images intégrées). Elle conserve la carte, la détection des zombies, les protections, les combats, l'équipement et les sauvegardes sur cet appareil.

Il suffit de **remplacer `index.html`** à la racine de ton dépôt GitHub Pages. Aucune installation, aucun framework et aucun dossier d'images nécessaire.

## Constructions — niveaux 1 à 5

La Base contient huit installations évolutives :

- **Récupérateur d'eau** : 2, 4, 6, 8, puis 10 eaux par jour (à récupérer une fois par jour).
- **Atelier d'armes** : armes débloquées aux niveaux 1 et 2 ; réparations progressives de +45 à +85 points de durabilité.
- **Potager** : de 1 à 5 rations par jour.
- **Générateur** : avec un carburant consommé pour la journée, le bonus de défense passe de +20 à +60 ; baisse également le niveau de menace.
- **Coin médical** : le repos restaure +15 à +35 points de santé.
- **Tour de guet (nouveau)** : rayon de détection autour du refuge de 150 à 650 m selon le niveau. Affiche les zombies repérés et ceux dont la trajectoire se rapproche du refuge. Il s'agit d'un radar sur les zombies simulés, pas d'une attaque automatique de hordes.
- **Réserve de stockage (nouveau)** : de 50 à 250 kg indépendamment du sac (30 kg, ou 40 kg avec équipement). Les ressources peuvent être déposées / retirées une unité à la fois. Les constructions et réparations faites **dans la Base** peuvent prélever dans le sac **ou** dans la réserve ; les zones SAFE éloignées continuent de réclamer les ressources portées dans le sac.
- **Station radio (nouveau)** : une transmission quotidienne aux niveaux 1–2, deux aux niveaux 3–4, trois au niveau 5. Des appels de détresse et missions spéciales demandent des fouilles ou l'élimination de zombies, puis donnent des ressources et de l'XP. À partir du niveau 3, transmissions mystérieuses. Dès le niveau 4, petit événement radio quotidien modifiant la menace fictive.

Chaque construction affiche **niveau / 5**, l'effet actuel, les matériaux nécessaires à l'étape suivante, ainsi que les quantités possédées (**sac + réserve**). Le bouton est bloqué si les matériaux sont insuffisants ou si le niveau maximal est atteint.

## Sauvegardes

La clé `dead-earth-alpha-v1` est inchangée. Les anciens bâtiments en booléens sont convertis en niveau 1 ; l'atelier déjà niveau 2 reste niveau 2. Les nouvelles données (niveaux, réserve, radio) sont ajoutées à la sauvegarde sans effacer les quêtes, les armes ou les constructions antérieures.

La date journalière, les stocks et les temps sont gérés localement par le navigateur, sans serveur. Les données seront perdues si l'utilisateur efface le stockage local du site.

## Tests

Syntaxe JavaScript validée avec `node --check`. Tests du moteur réalisés sur les coûts, la migration d'anciennes sauvegardes, les huit constructions jusqu'au niveau 5, le stockage séparé du sac, les transferts et la réserve pleine, la production, les missions radio, la récompense non répétable, ainsi que le rendu HTML de la Base dans un DOM simulé. Le navigateur de test de cet environnement bloque les adresses locales : **rendu iPhone réel à confirmer après publication**.
