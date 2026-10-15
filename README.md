# DEAD EARTH — V1.5 · Détection des zombies

## Installation (GitHub Pages)

Pour le dépôt `hugotronel-boop/dead-earth`, remplacer uniquement le `index.html` à la racine du dépôt par celui de cette archive, puis valider les changements (Commit changes). Les autres fichiers peuvent rester. Une fois la publication Pages actualisée, ouvrir https://hugotronel-boop.github.io/dead-earth/.

## Nouveautés

- **Sans micro (par défaut)** : un zombie à environ 35 m de la position GPS du joueur peut le détecter et commencer à le poursuivre. Aucune permission de microphone nécessaire.
- **Avec micro (facultatif)** : depuis ⚙ Options ou Perso → Discrétion, appuyer sur « Activer le micro ». La mesure locale du volume sonore module la portée de détection, entre 12 et 120 m. Régler la sensibilité de 1 à 10 dans ⚙ Options.
- **Poursuite** : un infecté repéré abandonne temporairement sa destination aléatoire pour s'approcher de la position GPS détectée. Il cesse sa chasse s'il perd la trace pendant environ 16 secondes.
- **Indicateur** : affichage du niveau sonore, de la portée de détection et du nombre d'infectés en chasse. Un ! apparaît près des zombies alertés.
- **Conservation des règles** : cases de 20 km², zones SAFE interdites aux zombies, réapparition 20 h après élimination, combats à 20 m, fouilles à 10 m et construction à 35 m.
- **Confidentialité** : l'audio n'est pas enregistré ni envoyé à un serveur ; le flux est analysé en mémoire. Le micro s'arrête sur demande, en quittant la page ou lorsqu'elle passe en arrière-plan. À chaque nouvelle session, il faut l'activer à nouveau volontairement.

## Important

Les micros et la géolocalisation nécessitent un site **HTTPS** et les autorisations correspondantes. Les sensibilités sont des seuils **de jeu**, pas un sonomètre calibré : il peut être nécessaire de les ajuster selon l'iPhone et son environnement.

La poursuite est **virtuelle** : inutile de courir ni de changer de chemin dans la réalité. Ne regarde pas l'écran en traversant la chaussée ou en conduisant. Reste sur des voies et dans des lieux publics autorisés.

Les comportements GPS et du microphone ont été testés avec des signaux simulés en navigateur ; la capture du vrai micro d'un iPhone reste à confirmer dans Safari/GitHub Pages.

## Conservation des données

La sauvegarde du jeu reste locale au navigateur et utilise la même clé que la V1.4 ; les ressources, zones SAFE, armes, zombies et progression ne sont pas réinitialisés par ce nouveau fichier. Pense à éviter d'effacer les données du site.
