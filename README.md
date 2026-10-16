# DEAD EARTH — V1.9 : équipements du survivant

Version à importer sur GitHub Pages : `index.html` (fichier autonome). Remplace uniquement l'ancien fichier `index.html` à la racine du dépôt `dead-earth` ; les autres fichiers du dépôt peuvent rester.

## Menu Perso

Quatre emplacements en grille 2 × 2 sous le portrait :
- **Arme principale** : couteau ou hache, influence les dégâts en mêlée et la durabilité.
- **Sac** : sac initial de 30 kg ; sac renforcé de 40 kg après fabrication.
- **Arme secondaire** : carabine fabriquée à l'atelier, équipée séparément de l'arme de mêlée ; s'utilise avec des munitions.
- **Protection** : gilet rembourré (après fabrication), réduit de 25 % les dégâts reçus lors des combats de zombies.

Appuie sur une case pour choisir un objet possédé ou retirer l'équipement quand c'est possible. Fabrique le **Sac renforcé** et le **Gilet rembourré** dans **Sac > Équipement à porter** avec les matériaux de l'inventaire. La fabrication consomme les ressources.

Coûts :
- Sac renforcé : 4 tissus, 2 bois, 1 pièce.
- Gilet rembourré : 5 tissus, 2 ferrailles, 1 pièce.

Les anciennes sauvegardes locales conservent leur progression : les armes fabriquées sont reconnues, et une ancienne carabine équipée est transférée vers la case secondaire.

## Technique

Le fichier unique embarque HTML, CSS, JS, sprites et données visuelles. Les nouvelles cases utilisent la sauvegarde locale existante `dead-earth-alpha-v1`.

Tests réalisés : syntaxe JavaScript, affichage sur viewport 390×844, ouverture des cases, navigation, fabrication/équipement/sauvegarde sur fixture de navigateur et migration d'une ancienne sauvegarde simulée. Test final sur iPhone conseillé avant usage prolongé. Le code a été préparé localement : aucune écriture directe sur GitHub n'a été effectuée.
