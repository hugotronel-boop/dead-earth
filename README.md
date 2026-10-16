# DEAD EARTH V1.8 — Repos jour / nuit

Mise à jour **uniquement dans la page Perso** à partir de la version V1.7.

- Le repos rend +25 points d’endurance le jour et +55 la nuit, plafonnés à 100.
- Heure réelle du téléphone et cycle actualisé toutes les minutes quand la fiche Perso est affichée.
- Si le GPS du jeu est activé : estimation astronomique locale du lever/coucher du soleil, sans appel réseau ni permission supplémentaire.
- Sinon : jour de 07:00 à 20:00 et nuit de 20:00 à 07:00, heure locale du téléphone.
- L’infirmerie conserve son bonus +15 santé, et les autres coûts de repos ne changent pas.
- Sauvegarde existante conservée : même stockage et aucun reset.

## Installation GitHub Pages

Remplacer **uniquement** le `index.html` à la racine du dépôt par celui-ci. Les autres fichiers ne changent pas.

Note : le cycle utilise l’horloge locale de l’appareil, qui n’est pas validée par un serveur (prototype solo). Les gains du repos ne sont pas encore limités par un nombre de repos par jour.
