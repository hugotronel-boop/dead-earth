# DEAD EARTH — V3.1 • Fonds externes

Cette mise à jour part de la V3.0 (inventaire de 66 objets) et ne change aucune règle du jeu. Les images ne sont plus incorporées au fichier HTML : elles sont chargées dans un dossier séparé.

## À placer à la racine du dépôt GitHub `dead-earth`

```
dead-earth/
├── index.html                  ← remplacer l’ancien fichier
└── image jeux/                 ← ajouter le dossier avec LES QUATRE images
    ├── fond-carte.jpg          ← ambiance de la page Carte, carte GPS toujours interactive
    ├── fond-base.jpg           ← arrière-plan de la Base
    ├── fond-sac.jpg            ← arrière-plan du Sac
    └── fond-quetes.jpg         ← arrière-plan des Quêtes
```

**Attention** : il faut maintenant mettre le dossier des images sur GitHub en plus de remplacer `index.html`. Sans les images, le jeu reste jouable, mais les arrière-plans ne s’afficheront pas.

## Liens relatifs utilisés dans `index.html`

- `./image%20jeux/fond-carte.jpg`
- `./image%20jeux/fond-base.jpg`
- `./image%20jeux/fond-sac.jpg`
- `./image%20jeux/fond-quetes.jpg`

`%20` correspond à l'espace dans le nom du dossier `image jeux`. Respecter les minuscules, les traits d'union et les extensions `.jpg`.

## Pour les futurs visuels

Déposer les nouvelles illustrations dans `image jeux/` avec des noms simples, en minuscules, sans accents ni espaces. Les quatre liens ci-dessus sont centralisés dans les variables CSS `--de-bg-carte`, `--de-bg-base`, `--de-bg-sac`, `--de-bg-quetes` en haut de `index.html`. La page Perso garde son ancien fond pour le moment.

## GitHub Pages

Une fois les fichiers ajoutés sur la branche publiée, l'adresse est normalement : `https://hugotronel-boop.github.io/dead-earth/`.
Si les images ne s'affichent pas, vérifier les chemins directement : `https://hugotronel-boop.github.io/dead-earth/image%20jeux/fond-sac.jpg` (par exemple).

Les noms des images ont été simplifiés, mais les fichiers jpg originaux n'ont pas été recompressés. Aucun changement des autres fonctionnalités ou des sauvegardes.
