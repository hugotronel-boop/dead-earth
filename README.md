# DEAD EARTH — V2.2 LIGHT | Générateur à essence

## Installation
1. Sur ton dépôt GitHub `hugotronel-boop/dead-earth`, remplace uniquement `index.html` par celui de cette archive.
2. Valide la mise à jour dans GitHub et recharge GitHub Pages.
3. Va dans Base > Production & Électricité.

## Nouveau générateur
- Le générateur doit être construit au préalable dans Constructions de survie.
- Réservoir de **8 unités** d'essence virtuelle.
- **1 unité permet 2 heures de fonctionnement** (8 unités = 16 heures).
- Remplir avec le carburant du **sac ou de la réserve** (`+1 unité` ou `Remplir`).
- **Démarrer** : la jauge baisse pendant le fonctionnement.
- **Arrêter** : la jauge reste figée, même après plusieurs heures.
- Au réservoir vide, le générateur s'arrête automatiquement.
- La consommation est enregistrée localement avec le reste de la partie et calculée selon le temps écoulé pendant la fermeture du jeu si le générateur est laissé en marche.
- Essence disponible notamment en fouillant des stations-service virtuelles référencées sur OpenStreetMap.
- Les effets déjà présents (défense / fabrication avancée) continuent à exiger un générateur en marche. On décidera ensuite ensemble quels autres équipements sont alimentés.

## Préservation des sauvegardes
Clé de sauvegarde inchangée : `dead-earth-alpha-v1`. Les anciennes parties sont chargées. Lors de la migration depuis V2.1, le générateur est initialement **éteint et vide**, car le système précédent utilisait une activation quotidienne. Il faut le ravitailler pour le redémarrer.

## Limites
Simulation solo basée sur l'horloge du téléphone. Les données sont conservées dans le stockage du navigateur, et ne sont pas anti-triche côté serveur. Ne jamais pénétrer dans un commerce pour jouer : tous les pillages sont virtuels.

## Vérifications
- Vérification syntaxique de tous les scripts JS : OK.
- Test du panneau sur un navigateur mobile simulé : OK.
- Tests moteur (2 heures allumé, 8 heures arrêté, panne sèche, remplissage depuis sac et réserve, marche/arrêt, réservoir plein) : OK.
- Le rendu complet sur iPhone et les véritables données GPS restent à vérifier après publication HTTPS.
