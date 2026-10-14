# DEAD EARTH — Alpha 0.2 🧟‍♂️

Prototype mobile **GPS + exploration à distance**. Jeu jouable en navigateur HTTPS / GitHub Pages, avec sauvegarde locale.

## Nouveautés 0.2

- **Carte rapide inspirée de Gpsmine** : rendu Canvas immédiat, tuiles vectorielles OpenFreeMap demandées en tâche de fond, dessin et cache des tuiles, zoom au doigt, déplacements fluides. Sans réseau, un fond schématique reste affiché. Le premier affichage des vrais bâtiments dépend de la connexion et du fournisseur ; il n’est pas garanti instantané.
- **Deux fouilles à distance par jour** (jour local du téléphone). À partir de la troisième, active le GPS et approche-toi à **120 m ou moins** d’un point de ravitaillement réel référencé sur OpenStreetMap pour effectuer une fouille virtuelle. Il est inutile d’entrer dans un bâtiment. En cas d’indisponibilité du service de lieux réels, les deux fouilles à distance restent disponibles ; les zones fictives ne permettent pas de contourner la limite.
- **Refuge géolocalisé** : saisis une adresse, cherche-la explicitement, puis ajuste un contour directement en touchant la carte. L’esquisse initiale **18 × 12 m** est purement indicative : elle **n’identifie pas automatiquement les murs** de ta maison. Le dessin est limité à **500 m²**, **35 m** autour de l’adresse et **12 sommets**.
- **Discrétion et microphone** : activation facultative dans l’onglet Survivant ; lors d’une fouille, permission micro sur demande et mesure du niveau sonore RMS dans le navigateur, qui augmente le risque de zombies. Aucun fichier sonore n’est créé ou envoyé. Le micro se coupe à la fin ou à l’annulation. Sans autorisation, la fouille reste jouable avec un bruit calculé selon sa méthode.
- **Journal radio retiré de l’écran Carte** ; journal des événements conservé dans Missions. Les autres pages et le gameplay alpha précédent sont conservés.

## Installation / publication sur ton dépôt

1. Décompresse `dead-earth-v02.zip` dans **Fichiers** sur iPhone ou ordinateur.
2. Ouvre https://github.com/hugotronel-boop/dead-earth et va sur **Add file → Upload files** (sur iPhone Safari : "Demander le site pour ordinateur" si nécessaire).
3. **Remplace ou ajoute** les fichiers du ZIP à la racine du dépôt. Pour `assets/`, conserve le dossier. Valide via **Commit changes**. Ne téléverse pas uniquement le ZIP.
4. Dans **Settings → Pages**, choisis **Deploy from a branch → main → / (root)** si ce n'est pas déjà configuré.
5. Ouvre https://hugotronel-boop.github.io/dead-earth/ ; attends quelques instants, puis recharge une fois pour renouveler les fichiers mis en cache.

Aucune commande de compilation. Pour tester localement : `python3 -m http.server 8000`, puis `http://localhost:8000` (micro/GPS sur un vrai téléphone demandent un contexte HTTPS ou localhost).

## Fichiers

- `index.html` : 5 écrans et interfaces
- `app.js` : sauvegarde, fouilles, GPS, refuge, micro, combat et survie
- `fast-map.js` : moteur Canvas, décodage de tuiles vectorielles et dessin local
- `fast-map.css` / `styles.css` : styles de carte et de jeu
- `sw.js` : cache du squelette de l’application
- `manifest.webmanifest` / `assets/` : installation sur écran d’accueil

## Confidentialité et limites

Le GPS est optionnel. La position exacte du téléphone n’est pas conservée dans la sauvegarde, mais **le contour et les coordonnées du refuge** sont enregistrés dans le stockage local de ce navigateur. Effacer les données du site efface aussi la progression. L’adresse saisie est transmise au géocodeur Nominatim **uniquement au clic sur LOCALISER**. Les requêtes cartographiques vers OpenFreeMap et les requêtes de points d’intérêt vers Overpass peuvent révéler au fournisseur la zone consultée. Les données ne sont pas diffusées à d'autres joueurs (il n'y a pas encore de multijoueur ni de serveur propre au jeu).

La carte repose sur les données © OpenStreetMap contributors et les tuiles OpenFreeMap. Pour une diffusion publique intensive, vérifier les conditions de service, les quotas, le géocodage et la confidentialité. La mécanique des 2 fouilles/jour est gérée localement : un futur serveur sera nécessaire pour lutter contre la triche. Les vrais commerces sont **des repères pour des actions virtuelles**, pas des lieux à pénétrer. Ne consulte jamais le jeu en conduisant, en traversant, ou en te déplaçant dans une situation risquée.

## Versions

0.1 : prototype 5 écrans + combat et inventaire.
0.2 : carte Canvas rapide + 2 fouilles à distance/jour + refuge dessinable + micro de discrétion + suppression du journal radio sur Carte.
