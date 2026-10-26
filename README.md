# DEAD EARTH — V2.9 · Dégradé nocturne renforcé

Version légère en un seul `index.html`, dérivée de la V2.8.

## Changement unique

Le brouillard nocturne conserve les sources de lumière de la V2.8, mais le halo tombe désormais rapidement vers le noir. La visibilité se calcule réellement en mètres sur la carte :

| Mode | Vision claire environ | Presque noir environ | Noir à partir d'environ |
|---|---:|---:|---:|
| Sans lampe | 10 m | 20 m | 30 m |
| Lampe allumée | 30 m | 60 m | 90 m |
| Refuge éclairé par le générateur | 120 m | 240 m | 360 m |

Les rayons nominaux de la V2.8 restent 50/150/600 m, mais leurs bords sont maintenant pratiquement invisibles : il s'agit d'un effet de halo lumineux beaucoup plus abrupt.

## Installation

Remplacer uniquement le fichier `index.html` à la racine du dépôt GitHub Pages. Aucune autre modification nécessaire. Les données sauvegardées sur le même domaine restent inchangées.

## Vérifications

- Syntaxe des trois blocs JavaScript : OK.
- Rendu du halo naturel, de la lampe et de l'éclairage du refuge dans Chromium avec l'heure de nuit simulée : OK, aucune erreur de page.
- Le GPS réel de l'iPhone et la disponibilité des données cartographiques sont à vérifier sur l'appareil.
