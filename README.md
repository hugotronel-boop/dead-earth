# DEAD EARTH — V1.2 | Zones SAFE & coûts réels de construction

Installation : remplace uniquement le fichier `index.html` dans la racine du dépôt GitHub `hugotronel-boop/dead-earth`. Aucun autre fichier ne doit être remplacé. Le jeu conserve la clé de sauvegarde locale `dead-earth-alpha-v1`.

## Changements

- Le cartouche du village (ex. « ☣ CORBENY ») est un bouton compact en haut à gauche. Appuyer dessus ouvre/ferme le menu Reconquête.
- Le menu indique le pourcentage protégé, les zones existantes, les matériaux nécessaires et le nombre possédé (« 4 / 5 »). Les quantités manquantes apparaissent en orange/rouge.
- Construire une nouvelle zone SAFE de niveau 1 (100 m de diamètre) nécessite initialement **5 bois, 2 ferrailles et 2 pièces**. Si des zones existent déjà, le coût augmente progressivement avec leur nombre. Maximum 16 zones dans cette alpha.
- Améliorer une zone coûte également des matériaux, avec un prix croissant de niveau 2 à niveau 10. Les coûts sont affichés avant de confirmer l'amélioration.
- Une construction est refusée lorsque les matériaux sont insuffisants, lorsque le GPS du joueur est à plus de 35 m du centre de la zone, ou lorsqu'un zombie virtuel se trouve dans le périmètre concerné. Le système vérifie une deuxième fois les conditions à la confirmation et **ne retire les matériaux qu'après validation réussie**.
- Les améliorations et constructions gardent la limite GPS de 35 m. Les combats à 20 m et les fouilles à 10 m sont inchangés.
- La carte, le personnage, l'inventaire, la base, les quêtes et les sauvegardes des versions précédentes sont conservés.

## Exemples d'économie (pour équilibrage)

Nouvelle zone 1 : 5 bois / 2 ferrailles / 2 pièces.
Nouvelle zone 2 : 6 bois / 3 ferrailles / 3 pièces.
Amélioration niveau 1 → 2 : 5 bois / 2 ferrailles / 2 pièces.
Les coûts plafonnent pour rester transportables avec un sac de 30 kg ; ils peuvent être rééquilibrés dans le code.

## Sécurité & limites

La géolocalisation nécessite HTTPS et l'autorisation du navigateur. Jouer à l'arrêt, sans pénétrer dans les commerces ni propriétés privés pour atteindre un marqueur. Les zombies et zones SAFE sont fictifs. Le jeu est une alpha à sauvegarde locale ; les délais et possessions ne sont pas sécurisés par un serveur. Le nom de la localité peut nécessiter la disponibilité du service de géocodage.
