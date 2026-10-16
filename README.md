# DEAD EARTH V2.0 LIGHT — Sans images

Version allégée de la V1.9 : uniquement le fichier `index.html` est nécessaire pour GitHub Pages. Toutes les images raster embarquées ont été retirées et remplacées par des emojis, des symboles et des motifs CSS. Le fond cartographique reste fonctionnel via un rendu Canvas de **données vectorielles OpenStreetMap/OpenFreeMap** (ce ne sont pas des images embarquées). Les mécaniques de la V1.9 sont conservées, avec la même clé de sauvegarde locale `dead-earth-alpha-v1`.

## Installation

Déposez `index.html` à la racine du dépôt GitHub, en remplaçant le précédent. Les anciens fichiers/images du dépôt peuvent rester : cette version n'en dépend pas.

## Quand tu prépareras ton dossier d'images

Les identifiants techniques des items sont conservés : `water`, `food`, `bandage`, `wood`, `metal`, `cloth`, `ammo`, `parts`, `medkit`, `fuel`. Le personnage est représenté par 🥷 et 🎒. Pour une future version, tu pourras préparer un dossier `assets/` avec des illustrations portant ces noms, mais **ce dossier n'est pas requis** aujourd'hui.

## Ce qui reste en ligne

La carte peut récupérer des **tuiles vectorielles** auprès d'OpenFreeMap et les lieux auprès des services OSM. Une connexion internet et le GPS (avec autorisation) restent nécessaires aux fonctions géographiques. Le jeu ne télécharge plus les anciennes photos/décors/sprites raster intégrés au fichier HTML.

## Limitations

Il s'agit d'une interface d'attente allégée, pas d'un nouveau graphisme pixel art définitif. Les emojis peuvent avoir un rendu un peu différent selon iOS/Android.
