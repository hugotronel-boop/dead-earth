# DEAD EARTH — V1.0 · LA RECONQUÊTE

## Installation sur GitHub Pages
Ce dossier contient une version autonome du jeu en **un seul fichier `index.html`**. Pour mettre à jour la version précédemment publiée, remplacez seulement le fichier `index.html` à la racine du dépôt `dead-earth` puis validez le commit. Aucun autre fichier du dépôt n'est à supprimer.

## Nouvelle mission principale
1. Dans **Carte**, activez **GPS** dans Options (ou choisissez une zone sur la carte pour tester sans GPS), puis cliquez **DÉMARRER ICI**.
2. Éliminez les infectés visibles sur la carte pour libérer le secteur : 8 pour un village, 12 pour une ville moyenne, 16 pour une grande ville. Il y a au maximum trois zombies affichés en même temps; les autres arrivent lorsque les précédents sont vaincus.
3. Une fois le secteur libéré, placez un refuge de 20 × 20 m en touchant la carte. Le carré doit être à l'intérieur de la zone de reconquête. L'emplacement ne peut ensuite être déplacé qu'une fois tous les 30 jours.
4. Améliorez le refuge de niveau 1 à 5, fouillez les commerces référencés sur OpenStreetMap pour obtenir des ressources et éliminez 4 patrouilles par nouveau palier.
5. Refuge niveau 5 et 16 patrouilles éliminées : zone sécurisée complète pour le secteur !

## Sauvegardes et limites
- Les sauvegardes existantes restent sur le même appareil et la même origine GitHub Pages. Une base déjà construite est conservée et passe directement à la reconquête des alentours : elle n'est pas supprimée.
- Les points d'intérêt proviennent des données OpenStreetMap si la connexion le permet; les objets et les zombies sont fictifs.
- La zone représentée est un **périmètre de gameplay**, pas la véritable limite administrative de la commune.
- Sans serveur, la progression et les verrouillages restent locaux; vider les données du navigateur les efface.
- Aucune localisation GPS exacte n'est transmise par le jeu à un serveur de jeu. Les zones et le refuge sont enregistrés localement; les requêtes aux fournisseurs de carte peuvent transmettre les coordonnées nécessaires à leur service.
- Ne vous déplacez jamais en regardant l'écran ou en conduisant. Les combats ne demandent aucune action physique réelle.

## Tests
Le code a passé la vérification de syntaxe JavaScript. Tests sur navigateur Chromium mobile simulé : démarrage de mission, 8 combats, libération du secteur, installation du refuge, première expansion et sécurisation complète.
