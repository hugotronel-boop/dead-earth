# DEAD EARTH — Survive the Fall 🧟

Prototype alpha 0.1 d'un jeu de survie zombie **hybride GPS + maison**, jouable en navigateur mobile ou sur ordinateur.

## Ce qui marche maintenant

- 5 écrans : carte tactique, survivant, refuge, inventaire, missions.
- Mode démo immédiat, sans GPS ni compte.
- Mode GPS **sur autorisation explicite** : carte centrée sur le joueur avec des lieux fictifs générés autour de lui (pas encore d'inventaire OpenStreetMap de véritables commerces).
- Carte Leaflet + fond OpenStreetMap si la connexion est disponible. Liste de lieux utilisable même sans chargement de carte.
- Fouille discrète, normale et brutale, avec bruit, coût d'endurance, butin et risque d'attaque.
- Combat au tour par tour : attaque, tir fictif, esquive, fuite, défaite avec retour au refuge.
- Inventaire de 30 kg, consommation de nourriture et d'eau, fabrication, soin, repos et améliorations du refuge.
- Horde simulée **sur demande uniquement** (pas de sanction hors ligne).
- Missions, XP, niveaux, historique, sauvegarde locale automatique.
- Manifest PWA et service worker pour certains fichiers d'interface (pas de carte complètement hors ligne).

## Installation locale

Il n'y a aucune commande de build et aucune dépendance à installer : les sources sont du HTML, CSS et JavaScript.

```sh
cd dead-earth
python3 -m http.server 8000
```

Ouvrir http://localhost:8000 dans un navigateur. Le fond de carte et les typographies peuvent demander une connexion Internet.

## Mettre le projet sur GitHub

1. Sur GitHub, créer un dépôt nommé `dead-earth` (public uniquement si tu souhaites le publier).
2. Sélectionner **Add file → Upload files** et importer **tous les fichiers et le dossier `assets/`**, pas seulement le ZIP.
3. Committer les fichiers sur `main`.
4. Pour publier sur le web : **Settings → Pages → Deploy from a branch → main → / (root)**.
5. Ouvrir l'URL GitHub Pages en HTTPS, puis sur iPhone utiliser Safari → Partager → Sur l'écran d'accueil.

## Structure

```text
dead-earth/
├── index.html
├── app.js
├── styles.css
├── sw.js
├── manifest.webmanifest
├── README.md
└── assets/
    ├── icon.svg
    └── demo-grid.svg
```

## Confidentialité / sécurité

- Le mode démo n'utilise jamais ta position.
- Le mode GPS doit être activé manuellement et demande une permission au navigateur ; la position précise **n'est jamais enregistrée dans la sauvegarde**. Il n'y a pas de serveur de joueurs ni de suivi en arrière-plan.
- Quand tu actives le GPS, les coordonnées servent à centrer le fond de carte OpenStreetMap dans le navigateur et à répartir des **zones fictives** autour de toi. Les fournisseurs de tuiles peuvent en déduire la zone affichée.
- Le refuge affiché sur la carte est un repère virtuel. Le projet n'envoie pas ta véritable adresse à d'autres joueurs.
- Il ne faut jamais entrer dans un magasin, bâtiment privé, zone dangereuse, ou traverser une route pour jouer. Les combats et fouilles ne demandent aucun déplacement physique.
- La sauvegarde utilise `localStorage` : effacer les données du site efface la progression.
- Pour une publication avec de nombreux joueurs, prévoir un fournisseur cartographique adapté, respecter les conditions d'utilisation des tuiles et ajouter une politique de confidentialité conforme.

## Limites de cette alpha

Pas encore de vrais commerces repérés par leur catégorie, de personnages animés sur la carte, de multijoueur, de serveur, ni d'expéditions virtuelles en temps réel. Les zombies sur la carte représentent des zones de danger ; un ennemi apparaît lors de certaines fouilles. Les attaques de hordes sont déclenchées à la demande.

Pour passer à une version complète, la prochaine étape sera : récupérer des points d'intérêt réels avec un service adapté (sans exposer les coordonnées personnelles), développer des expéditions virtuelles avec distances/coûts, et créer un directeur de menace persistant.
