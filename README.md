# DEAD EARTH — Pixel Survival 0.3

Jeu mobile GPS de survie zombie en pixel art, avec le personnage illustré de la fiche de survivant originale. Aucun framework / aucune compilation / aucun abonnement requis pour tester cette alpha. Le moteur de terrain utilise un Canvas avec tuiles vectorielles OpenFreeMap (inspiré de Gpsmine). En cas d'indisponibilité du réseau, un terrain pixel art géoréférencé schématique apparaît immédiatement.

## Installer facilement sur iPhone avec GitHub Pages

**Méthode recommandée : le fichier unique `index.html`.**

1. Télécharge le fichier `index.html` du dossier `DEAD-EARTH-PIXEL-V3-UN-SEUL-FICHIER` (fourni séparément).
2. Ouvre https://github.com/hugotronel-boop/dead-earth sur Safari, puis **Add file → Upload files**. Choisis le fichier `index.html` et valide **Commit changes** pour remplacer l'ancien.
3. Si nécessaire, active **Settings → Pages → Deploy from a branch → main → /(root)**.
4. Ouvre https://hugotronel-boop.github.io/dead-earth/. Si tu vois encore l'ancienne version, ferme l'onglet puis recharge ; une ancienne installation hors-ligne peut conserver temporairement l'ancien cache.

**Méthode alternative : projet organisé.** Décompresse le ZIP complet et importe `index.html`, `app.js`, `fast-map.js`, `pixel-ui.js`, `styles.css`, `fast-map.css`, `manifest.webmanifest`, `sw.js`, `icon.svg` et **tout le dossier `assets/`**, en préservant le chemin `assets/`. Le fichier `index.html` seul du ZIP complet ne suffit pas sans les autres fichiers.

## Gameplay dans cette version

- **La carte est au milieu de l'écran**, avec rendu pixel art, routes et bâtiments réels lorsque les données sont disponibles ; elle se déplace avec le doigt, pincement = zoom, double-tap = zoom.
- **HUD haut** : vie, endurance, hydratation, niveau/XP.
- **Personnage au premier plan** : silhouette du survivant dessinée à partir de l'illustration de référence, petites animations de repos, marche, course, fouille, blessure, manger et boire. Les animations de déplacement réagissent au GPS lorsque le navigateur transmet une nouvelle position.
- **Bas de l'écran** : fiche survivant, inventaire mis à jour et navigation Carte / Perso / Base / Sac / Quêtes.
- **Fouille** : sélectionner un point de ravitaillement sur la carte (ou ouvrir FOUILLER), choisir discrète, normale ou brutale, lancer la fouille, obtenir du butin et risquer un combat contre un zombie. Les marqueurs de zombies sont aussi touchables pour déclencher un combat.
- **Deux fouilles à distance par jour local**. Après, il faut être à **120 mètres au maximum d'un commerce public référencé OSM**, avec le GPS activé, pour fouiller. Il n'est jamais nécessaire d'entrer dans un bâtiment. Les marqueurs fictifs ne permettent pas de contourner cette limite.
- **Zone safe personnelle** : bouton REFUGE, adresse choisie, contour initial fictif de **18 × 12 m**, pouvant être redessiné directement sur la carte ; limite 500 m² et 35 m autour de l'adresse. Il ne s'agit pas d'une détection automatique de la maison.
- **Discrétion/micro** : facultatif dans Perso. Pendant la fouille, si autorisé, le volume est calculé localement sans stockage ni transfert audio. Le micro s'arrête à la fin ou l'annulation.
- Inventaire, craft, défense de base, missions, expérience et sauvegarde automatique locale.

## Confidentialité et limites

- Pas de multijoueur ni de serveur de comptes dans cette alpha. La progression se conserve **seulement dans ce navigateur** ; effacer les données du site la supprime. Le GPS précis n'est pas stocké. L'emplacement que tu choisis comme refuge reste stocké localement, uniquement pour délimiter la zone.
- Le nom de rue/adresse est envoyé à Nominatim au clic sur LOCALISER. OpenFreeMap et Overpass peuvent connaître la zone cartographique et GPS consultée lors des requêtes. Respecter leurs limites d'utilisation avant de diffuser le jeu à grande échelle.
- Le GPS et l'accès micro sur téléphone nécessitent HTTPS (GitHub Pages) et l'autorisation de l'utilisateur. La carte peut prendre du temps à charger les détails géographiques la première fois ou rester schématique si le fournisseur est indisponible. Les déplacements du personnage sont virtuels et ne demandent jamais de courir réellement.
- La limite des fouilles utilise l'horloge locale : un backend serait indispensable pour un anti-triche sérieux.
- L'interface et le graphisme du survivant utilisent une illustration déjà générée pour ce projet ; les animations du corps sont de petites transformations d'image (pas encore un spritesheet image par image).

## Architecture

- `index.html` : écran mobile, 5 onglets, tiroirs de fouille/refuge et HUD.
- `styles.css` : nouveau style pixel-art et responsive.
- `app.js` : moteur de jeu conservé et amélioré depuis alpha 0.2.
- `pixel-ui.js` : mini-inventaire live, panneaux, navigation, animations et contrôles de dessin.
- `fast-map.js` / `fast-map.css` : géométrie GPS et tuiles vectorielles Canvas optimisées, dessin du terrain schématique immédiat, marqueurs.
- `assets/` : personnage, portrait et icônes pixel art.
- `sw.js` / `manifest.webmanifest` : cache du site, installation PWA.

### Test local (ordinateur)

`python3 -m http.server 8000` depuis ce dossier, puis ouvrir `http://localhost:8000`. Le test sur iPhone doit se faire sur GitHub Pages HTTPS pour obtenir les permissions GPS et micro.
