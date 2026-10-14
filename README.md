# DEAD EARTH — Pixel Survival v0.4

Prototype mobile jouable, **mise à jour limitée à la page Carte**. Les autres pages continuent de fonctionner avec les règles antérieures.

## Nouveautés
- Suppression de la carte « zone contaminée » en haut et des panneaux Survivant / Inventaire en bas de la carte. Les infos Santé/Endurance/Hydratation/Niveau restent dans le HUD et les pages dédiées.
- Menu « ⚙ OPTIONS » en haut à droite : GPS, Démo, Centrer, Zoom +/−.
- Compteur de jours : Jour 1 le jour de la création de la partie, Jour 2 à la date civile locale suivante, et ainsi de suite (pas d'attente de 24h exactes).
- Refuge : bouton « Refuge » > « Placer mon refuge », puis toucher un endroit sur la carte pour prévisualiser le carré **20 × 20 m**, confirmer. La position est mémorisée uniquement dans le navigateur. Déplacement possible **à nouveau 30 × 24 heures après le dernier placement validé**. Un ancien refuge v0.3 peut être replacé une fois lors de la migration.
- Fouilles : deux à distance par jour civil local ; les autres demandent d’être réellement près (120 m) d’un commerce référencé OpenStreetMap, avec une précision GPS suffisamment bonne (120 m ou mieux). Détection de commerces à 2,8 km via Overpass : supermarchés, commerces alimentaires, pharmacies, quincailleries, stations-service et autres catégories pertinentes. Les lieux réels s'affichent sans réinventer de commerce si la recherche échoue. Le ravitaillement demeure purement virtuel.

## Installer (GitHub Pages)

### Version simple, 1 fichier
1. Ouvrir le dossier `DEAD-EARTH-PIXEL-V4-UN-SEUL-FICHIER`.
2. Envoyer **index.html** à la racine de `hugotronel-boop/dead-earth` sur GitHub (Upload files / Commit changes).
3. Ouvrir https://hugotronel-boop.github.io/dead-earth/ après la publication.

### Version modulaire (archive ZIP)
Décompresser puis transférer tous les fichiers et le dossier `assets/` à la racine du dépôt.

## Notes importantes

- Les données des commerces et les tuiles graphiques dépendent de la disponibilité des services OpenStreetMap/Overpass et OpenFreeMap et d'une connexion réseau. Le terrain de secours fonctionne hors ligne.
- Les positions de refuge et l'état du jeu sont stockés localement dans `localStorage`. Le verrouillage de 30 jours **n'est pas anti-triche** : effacer les données du navigateur ou recommencer la partie le réinitialise. Une règle garantie entre appareils exigerait un serveur / compte joueur.
- Le GPS et le microphone demandent la permission. Les coordonnées GPS précises du joueur ne sont pas sauvegardées ; le point privé du refuge l'est sur l'appareil. N'entre dans aucun lieu réel pour jouer, ne joue pas en conduisant, et évite les déplacements risqués.
- En cas de version affichée en cache, recharger la page ou effacer l'ancien cache GitHub Pages / PWA. Le Service Worker est versionné `v4`.

## V0.5 — Page Perso
- Ligne « Bruit accumulé » remplacée par « Fatigue » (100 − endurance).
- Nom du survivant personnalisable (2–20 caractères), mémorisé dans la sauvegarde locale existante.
- Discrétion et calcul du bruit des zombies inchangés.
- Les autres pages restent identiques à la V0.4.
