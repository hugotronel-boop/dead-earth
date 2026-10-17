# DEAD EARTH — V2.3 LIGHT : réseau électrique

Une version autonome du jeu en un **seul `index.html`**. Elle prolonge DEAD EARTH V2.2 sans remettre les grandes images intégrées.

## Installer sur GitHub Pages

1. Dans le dépôt `hugotronel-boop/dead-earth`, remplace **uniquement** `index.html` par le fichier livré.
2. Valide avec **Commit changes**.
3. Ouvre `https://hugotronel-boop.github.io/dead-earth/` ; si l’ancienne version s'affiche, recharge la page en ignorant le cache.

Les autres fichiers du dépôt peuvent rester. Le jeu continue d'utiliser sa sauvegarde `localStorage` de la même origine. Une sauvegarde stockée sur un autre appareil ou navigateur n'est pas transférée automatiquement.

## Système électrique

- **Cycle jour/nuit :** avec GPS, calcul solaire approximatif d'après la position ; sinon jour 07:00–20:00 selon l'horloge locale du téléphone.
- **Éclairage :** la carte s'assombrit la nuit ; un cercle de **300 m de rayon** autour du refuge est plus clair si le générateur ET son circuit d’éclairage fonctionnent. La lumière **ne chasse pas les zombies**.
- **Générateur :** capacité de carburant **8 unités** ; consommation de base **0,50 unité/heure**, plus **0,12 unité/heure par kW de circuits activés** ; usure mécanique **0,6 point de durabilité/heure** de marche. Aucune essence consommée à l’arrêt.
- **Panne :** réservoir vide ou état mécanique nul => arrêt automatique, tous les consommateurs électriques hors service. Le moteur peut être réparé **à l'arrêt**, pour 2 ferrailles et 2 pièces, soit +45 points mécaniques.
- **Puissance du générateur :** de **3 kW virtuels** au niveau 1 à **7 kW virtuels** au niveau 5.

| Circuit | Puissance | Condition | Fonction |
| --- | ---: | --- | --- |
| 💡 Éclairage extérieur | 1 kW | Refuge posé | Zone éclairée de 300 m de rayon pendant la nuit |
| ⚒ Atelier d'armes | 2 kW | Atelier construit | Fabrication/réparation seulement sous tension, outils avancés à l'atelier niveau 3 |
| 📻 Station radio | 1 kW | Station construite | Missions, transmissions et récompenses seulement si alimentée |
| ✚ Infirmerie avancée | 2 kW | Infirmerie niveau 2+ | Soins électriques améliorés ; bandages simples possibles sans électricité |

Tous les circuits sont **indépendants**. Si leur demande dépasse la puissance disponible, il faut en couper un ou améliorer le générateur. Les circuits activés restent mémorisés pendant les coupures : ils reprennent seulement lorsque le moteur fournit de nouveau de l'électricité.

Le récupérateur d’eau, le potager, la réserve de stockage et les bandages simples ne nécessitent pas de courant. Les circuits fonctionnent même lorsque tu ne regardes pas la page Base.

## Vérifications réalisées

- Contrôle de syntaxe des trois scripts inclus.
- Tests automatisés navigateur : arrêt/démarrage, arrêt des armes/radio/soins avancés, puissance maximale, panne sèche après plusieurs heures, usure, pas de consommation à l'arrêt.
- Test visuel sur une carte centrée sur le refuge, la nuit : zone éclairée quand le circuit est alimenté, obscurcie quand il est coupé.

**À vérifier encore sur iPhone :** localisation et heure de coucher du soleil, rafraîchissement de l'affichage avec le GPS réel et confort des panneaux sur écran réduit.
