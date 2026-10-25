# DEAD EARTH V2.6 — Dégâts et usure des armes

Mise à jour depuis la V2.5 LIGHT. Le jeu tient dans **un seul fichier `index.html`**, que tu peux remplacer directement à la racine de ton dépôt GitHub Pages.

## Nouveautés

Chaque arme a sa **plage de dégâts** et sa **perte de durabilité par attaque**, sur 100 points au départ. Valeurs au niveau 1 :

| Arme | Dégâts / attaque | Durabilité perdue / utilisation |
|---|---:|---:|
| Couteau usé | 7–11 | 4 |
| Batte renforcée | 9–15 | 5 |
| Lance de fortune | 13–20 | 7 |
| Hache de récupération | 16–24 | 8 |
| Machette de récupération | 18–27 | 6 |
| Pistolet récupéré | 22–32 | 5 |
| Arbalète artisanale | 24–36 | 4 |
| Carabine rafistolée | 32–46 | 7 |
| Fusil à pompe de récupération | 42–60 | 9 |
| Matraque électrique | 20–33 | 6 |

- Au **niveau 0 de durabilité**, l'arme est **cassée** et ne peut plus servir. Un survivant dont l'arme de mêlée est cassée peut uniquement donner de faibles coups à mains nues (2–5 dégâts). Une arme à distance cassée ne peut pas tirer et ne consomme aucune munition.
- Après chaque attaque avec une arme fonctionnelle, sa durabilité diminue selon son modèle. L'attaque qui termine la durabilité à 0 inflige encore ses dégâts, puis l'arme casse.
- Les améliorations jusqu'au niveau 5 ajoutent **+2 dégâts min/max par niveau** en mêlée ou **+3 dégâts min/max par niveau** à distance. Elles **ne restaurent pas** la durabilité.
- Les réparations sont réalisées à l'atelier électriquement alimenté, en consommant les matériaux du sac ou de la réserve. Une arme réparée peut de nouveau servir.
- Les statistiques et l'état de l'arme sont visibles dans l'atelier, la fiche d'équipement et les combats.

## Sauvegarde

Les anciennes sauvegardes V2.5 et antérieures sont conservées. La durabilité déjà enregistrée des armes reste intacte ; seuls les dégâts et l'usure par utilisation sont mis à jour.

## Installation

1. Télécharge `index.html`.
2. Remplace le fichier `index.html` situé à la racine de ton dépôt GitHub `dead-earth`.
3. Enregistre avec **Commit changes** puis recharge GitHub Pages. Aucun autre fichier n'est requis pour cette version.

Le jeu demeure un prototype solo avec sauvegarde locale sur le téléphone. Les autres pages n'ont pas été repensées.
