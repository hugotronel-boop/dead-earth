# DEAD EARTH V2.7 LIGHT — Vision nocturne

## Mise à jour GitHub Pages

Télécharge `index.html` et remplace **uniquement** le fichier `index.html` à la racine du dépôt GitHub `hugotronel-boop/dead-earth`. Les autres fichiers peuvent rester en place.

## Nouvelles règles

- **Cycle jour/nuit réel** : conserve le système existant fondé sur le GPS et le soleil lorsqu'il est actif, et l'heure locale du téléphone autrement.
- **Nuit sans éclairage** : masque sombre avec dégradé, visibilité d'environ **10 mètres** de rayon autour du marqueur du joueur.
- **Lampe torche** : nouvel objet `flashlight` dans le sac (0,4 kg), assez facile à obtenir lors des fouilles de lieux réels répertoriés, sans fouille à distance. Tant qu'une lampe n'est pas possédée, le bouton reste désactivé.
- **Équiper** : page **Perso**, cinquième emplacement sous les quatre cases actuelles, intitulé **LAMPE**. Sélectionner la lampe l'allume.
- **Allumer / éteindre** : page **Carte → ⚙ Options → Vision nocturne**. Lampe équipée et allumée : **75 mètres** de portée (avec fondu progressif).
- **Éclairage extérieur du refuge** : les **300 mètres** existants sont maintenus, uniquement quand le refuge existe, que le générateur tourne, qu'il contient du carburant, et que le circuit d'éclairage a de la puissance. Il n'éclaire pas une autre position ou une zone SAFE sans refuge.
- **Aucun éclairage** : si le générateur s'arrête ou manque d'essence, ses 300 mètres d'éclairage disparaissent. La lampe personnelle reste indépendante du générateur.
- Le gradient suit les coordonnées géographiques, donc déplacer la carte ne déplace pas magiquement la lumière du joueur.
- Les sauvegardes V2.6 restent lisibles : ajout de nouveaux champs avec valeurs par défaut.

### Simplifications de cette version

- La lampe n'a pas encore de système de piles ou de batterie : elle fonctionne une fois trouvée, équipée et allumée. Ce sera un choix d'équilibrage ultérieur.
- Les tuiles vectorielles de la carte demandent toujours une connexion. Le fond schématique fonctionne même sans données de carte.
- Le brouillard réduit **la visibilité graphique**, mais les interactions existantes conservent leurs vérifications de distance GPS (10 m pour fouiller, 20 m pour combattre, 35 m pour construire).
- Ne joue pas en marchant sans regarder devant toi et ne te rends pas dans des lieux interdits pour les actions virtuelles.

## Tests réalisés

- Vérification de syntaxe des 3 scripts JavaScript intégrés avec Node.js.
- Interface navigateur mobile Chromium, aucune erreur JavaScript au chargement.
- Cinquième emplacement d'équipement présent, sélection d'une lampe possédée, activation/désactivation via Options, et persistance dans la sauvegarde simulée.
- Aperçu des trois portées nocturnes (10 m, 75 m et 300 m) sur la carte Canvas.

## Poids

Un seul `index.html` léger, sans images de jeu intégrées.
