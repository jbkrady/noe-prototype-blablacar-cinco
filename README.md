# BlaBlaCar · Newbie drivers — prototype interactif

Prototype réalisé dans le cadre de la **formation Product Manager de Noé** (groupe BlaBlaCar 5). Ce n'est pas une application officielle BlaBlaCar.

**Démo en ligne : https://noe-prototype-blablacar-cinco.vercel.app**

Objectif : aider les nouveaux conducteurs (« newbies ») à réussir leur premier trajet. Le prototype se manipule comme la vraie application Android : on saisit des adresses, on choisit des dates, on publie un trajet, on complète son profil, on cherche un covoiturage.

## Ce que montre le prototype

| Parcours | Écrans | Ce qu'on y voit |
|---|---|---|
| **Profil** (conducteur) | Profil, photo, pièce d'identité | Carte « État du profil » avec une seule action à la fois et une jauge ; vérification de la photo dans l'application (refus avec les règles, puis acceptation) ; sections modifiables avec le crayon |
| **Publier un trajet** | Adresse, carte, itinéraire, étapes, dates, heure, places, réservation instantanée, prix, Zen, retour, rappel de profil, assurance, description, boost | Rappel de ce qui manque au profil sans bloquer la publication ; description avec texte d'exemple et message rassurant ; message de boost affiché une seule fois |
| **Vos trajets** | Liste des trajets | Trajet dans moins de 24 h sans passager signalé en orange, avec les éléments à compléter en un clic |
| **Rechercher** (passager) | Accueil, recherche, résultats, fiche conducteur | Encart « Ils rejoignent la communauté des conducteurs » réservé aux vrais nouveaux vérifiés ; badge « N Trajets Passager » pour les débutants qui ont déjà voyagé |

Les user stories correspondantes sont dans le backlog JIRA « PM Noé Team » (SCRUM-5 à SCRUM-15). Les maquettes de référence sont dans le Figma « BlaBlaCar 5 », page PROTOS.

## Utiliser la démo

- **Sur ordinateur** : l'application s'affiche dans un téléphone Android (360 × 800), avec à côté un panneau de présentation.
- **Sur téléphone** : l'application occupe tout l'écran ; le panneau s'ouvre avec la languette ☰ sur le bord droit.

Le panneau de présentation sert à la personne qui présente :
- **Écran affiché** : ce que montre l'écran en cours, en une ou deux phrases.
- **Parcours** : raccourcis vers chaque parcours ; chacun repart d'un profil vierge (Coralie, conductrice débutante).
- **État de la démo** : cocher « Photo de profil acceptée » et « Identité vérifiée » pour montrer un profil complet ; « Message de boost déjà vu » ; liste « Vérification photo » pour choisir le résultat de la vérification (1re photo refusée puis acceptée dans le profil, toujours acceptée, ou délai de 15 s dépassé).
- **Réinitialiser la démo** : tout remettre à zéro.

Règles utiles pendant une démo :
- Tout ce qu'on fait dans un parcours reste tant qu'on y reste, et repart à zéro dès qu'on change d'onglet.
- Pendant la publication, la photo est acceptée du premier coup ; le refus puis l'acceptation se montrent depuis le Profil.
- Les trajets publiés restent visibles dans Vos trajets.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5173. Chaque mise à jour poussée sur GitHub est publiée automatiquement sur le lien de la démo.
