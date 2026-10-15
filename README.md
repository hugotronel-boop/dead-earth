# DEAD EARTH — Alpha 1.1.1 : reconquête GPS

Version **fichier unique `index.html`** pour GitHub Pages, conçue pour être jouée sur téléphone. Le design pixel art et les menus Personnage, Base, Sac et Quêtes ont été conservés.

## Nouvelle boucle de jeu

1. Active le GPS depuis les options. Place le carré de refuge de **20 × 20 m**, près de ton logement (au plus 40 m de ta position GPS). Une confirmation « C’est bien chez toi ? » est obligatoire. Le refuge ne pourra ensuite être déplacé qu'après **30 jours**. En cas de migration depuis une ancienne version, le refuge non encore confirmé peut être corrigé avant de commencer.
2. La commune est représentée par un **secteur de jeu approximatif**, dont les frontières ne reproduisent pas les limites administratives. Des zombies virtuels patrouillent à des positions déterministes dans les secteurs non protégés. Il n'y a **pas de quota global de zombies à tuer**.
3. Pour lancer un combat, tu dois sélectionner le zombie visible sur la carte et être à **20 m ou moins** de sa position, avec un GPS récent et suffisamment précis. Chaque attaque vérifie à nouveau la portée. Un zombie vaincu ne réapparaît pas dans cette partie.
4. Pour fouiller, sélectionne un **véritable commerce ou lieu référencé** depuis les données OpenStreetMap, puis sois à **10 m ou moins**. Le jeu vérifie la distance au début et à la fin de la fouille ; **aucune fouille à distance** n'est autorisée.
5. Tu peux poser une **zone SAFE** quand tu te trouves à moins de 35 m de son centre et que **tous les zombies susceptibles de passer dans le périmètre** ont été éliminés. Le niveau 1 couvre **100 m de diamètre**. Chaque niveau augmente le diamètre de **100 m**, jusqu'au **niveau 10 = 1 000 m de diamètre**. Chaque amélioration demande des matériaux de survie et que l'extension soit libre de zombies.
6. Le but est de **couvrir tout le secteur** avec des zones SAFE. Un indicateur de surface protégée suit la reconquête. Les zones non sécurisées peuvent encore contenir des infectés.

## Contraintes réelles

- Le GPS mobile présente une **marge d'erreur**. Pour éviter les validations à distance par erreur, le prototype exige une précision de localisation compatible avec l'action (jusqu'à ±17 m pour une fouille à 10 m, ±27 m pour un combat à 20 m, au maximum ±35 m pour une construction).
- Il faut être **à l'arrêt** pour interagir avec la carte. Ne regarde pas l'écran en conduisant ou en traversant. Ne cours pas après les zombies virtuels, n'entre pas sur une propriété ou dans un commerce sans autorisation. Si un marqueur est inaccessible depuis un lieu public, ne tente pas de l'atteindre.
- Le jeu n'est pas multijoueur. La progression et le placement du refuge sont conservés dans le stockage local de l'appareil ; ils peuvent être perdus en effaçant les données du navigateur. Les coordonnées GPS exactes ne sont pas sauvegardées comme position courante, mais la position choisie du refuge est enregistrée **localement**. Les services cartographiques peuvent recevoir des coordonnées **approximatives** des secteurs explorés pour fournir carte, noms de communes et points d'intérêt.
- Les limites administratives réelles des communes ne sont **pas encore intégrées**. La reconquête concerne pour le moment un périmètre circulaire de jeu.

## Mise à jour GitHub Pages

Dans le dépôt `hugotronel-boop/dead-earth`, remplace l'ancien `index.html` par celui de ce dossier. Les autres fichiers peuvent rester inchangés ; cette édition embarque ses scripts, styles et images dans le seul HTML.

L'application doit être servie en **HTTPS** pour les fonctions de géolocalisation et de micro.

## Tests effectués

- Validation du refuge et confirmation explicite.
- Vérification de l'accès à 10 m et à 20 m, avec refus à 11 m / 21 m dans un scénario de test géolocalisé.
- Test d'une zone bloquée par un zombie puis construite après élimination.
- Vérification de l'absence d'erreurs JavaScript dans un navigateur de test avec coordonnées simulées.

Les fonctionnalités devront encore être vérifiées sur un véritable iPhone avec GPS actif et données OpenStreetMap disponibles.
