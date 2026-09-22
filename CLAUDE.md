# CLAUDE.md — prototype BlaBlaCar · Newbie drivers

Prototype interactif d'application Android (360×800) pour présenter aux sponsors BlaBlaCar les user stories du projet « newbie drivers ». Réalisé dans le cadre de la formation Product Manager de Noé. Voir README.md pour la présentation fonctionnelle.

## Façon de travailler avec l'utilisateur

- **Répondre en français**, de façon **courte** : ce qui a été fait, en quelques points. Pas de longs récapitulatifs.
- **Montrer en local avant de pousser.** Tester soi-même dans le navigateur, puis attendre « ok pour pousser » avant tout `git push` sur `main` (le push déploie en production).
- **Tester soi-même chaque changement** avant de rendre la main : navigateur intégré (vue ordinateur 1280×900 et téléphone 360×732 ou 390×844), parcours joué de bout en bout, console vide, `npm run build` sans erreur.
- **Poser la question** quand une demande est ambiguë (plusieurs lectures possibles) plutôt que deviner : l'utilisateur tape vite et des mots manquent parfois (« il ne faut que » peut vouloir dire « il ne faut pas que »).
- Ce qui est décidé par l'utilisateur prime sur la maquette et sur les US. Quand un changement contredit une US, le signaler en une phrase, puis faire ce qui est demandé.

## Sources de vérité

- **Backlog JIRA** « PM Noé Team », projet `SCRUM`, cloudId `453d1c29-c443-413d-ace8-d7b3014e8ce7` (site jeanbaptistekrady.atlassian.net). US du périmètre :
  - A1 SCRUM-8 : carte « État du profil » et étape de rappel pendant la publication
  - A2 SCRUM-9 : rappel sur un trajet dans moins de 24 h sans passager (Vos trajets)
  - A3 SCRUM-10 : vérification de la photo dans l'application (refus, délai de 15 s ; plus de toast à l'acceptation)
  - B1 SCRUM-11 / B2 SCRUM-12 : texte d'exemple et message sous la description du trajet
  - C1 SCRUM-13 : encart des nouveaux conducteurs vérifiés dans la recherche
  - C2 SCRUM-14 : message de boost en fin de publication, une seule fois
  - C3 SCRUM-15 : badge « N Trajets Passager » / « ★ Nouveau » (V2 : « Super Passager » à la place de « N Trajets Passager », décision utilisateur)
  Ne modifier une US dans JIRA que sur demande explicite, en montrant le texte avant d'écrire.
- **Figma** « BlaBlaCar 5 », fileKey `UnHpC3FL9BRJzvbNZ0vnNv`, page PROTOS. Sections du périmètre : « PUBLIER UN TRAJET », « Modification de profil et sanity check (Amélie) », « Référencement Newbie ». **Hors périmètre** : l'écran « Flows » et la section « Identification des conducteurs - Onboarding (JB) ». Écran de référence de la description : **DESC TRAJET** (10:1090).
- Figma est la **référence visuelle** ; les écrans sont **recodés en React** (une première version à base d'images Figma cliquables a été rejetée : l'utilisateur veut une vraie app manipulable).

## Décisions produit en place (ne pas défaire sans demande)

- **Parcours étanches** : ce qu'on fait dans un parcours reste tant qu'on y reste ; quitter l'onglet (tab bar vers un autre onglet, bouton Accueil Android, parcours lancé depuis le panneau) remet le profil à zéro via `resetProfile()`. Les trajets publiés, la recherche, le témoin « boost déjà vu » et le réglage de démo sont conservés. Exception : en arrivant sur **Vos trajets** (onglet ou panneau), la conductrice a déjà sa photo (`resetProfile(true)` / `reset(true)`).
- **Vos trajets (A2, maquette MES TRAJETS V3, node 372:3230)** : encart affiché si départ < 24 h, 0 passager et une info manquante (`tripMissingInfo` : photo, étapes, description ; l'identité n'entre plus en compte). Critères dans un **ordre fixe**, sans tri : « Ajouter des étapes », « Ajouter une description », « Ajouter une photo de profil » (même libellé coché ou non pour la photo). Encart placé avant la date et l'itinéraire. Trajet de démo de demain sans étapes ni description, donc état initial : étapes et description à faire, photo cochée. « Ajouter des étapes » n'a pas encore d'écran cible.
- **Photo** : acceptée directement pendant la publication et depuis Vos trajets ; refus puis acceptation **uniquement depuis le Profil** (`rejectsNext` dans `profile.tsx`). Pas de sélecteur de fichiers : les boutons enchaînent sur la vérification avec les photos de la maquette (lunettes = refusée, Coralie = acceptée).
- **Ordre des étapes** : la **photo avant la pièce d'identité** partout où l'identité apparaît (profil, rappel de publication).
- **Encart C1** : seulement les vrais nouveaux (0 trajet passager) avec photo, identité **et** numéro vérifiés (Feroze, Yamina). Les débutants qui ont déjà voyagé (Nicolas 13, Inès 4) restent dans la liste principale avec leur badge. Badge « Super Passager » (V2, dès un trajet passager, sans le nombre) en bleu, comme « Super Driver », avec une icône de passagers. Sur la fiche conducteur, la ligne « N trajets passager » ne concerne que les non-débutants.
- **Profil** : nom, prénom et date de naissance ne s'affichent plus sur la page du profil (confidentiels) ; ils restent modifiables via le crayon de « Votre identité ».
- **Adresses** (champs vides à l'ouverture, saisie libre toujours possible) : départ = « Utiliser ma position actuelle » (65 Rue Ordener, Paris) + Paris ; arrivée = Lyon pour la recherche, Capbreton pour la publication. On ne peut pas choisir la même ville au départ et à l'arrivée ; en recherche, seules des villes sont proposées.
- **Parcours de publication raccourci (V2)** : départ → point de départ (carte) → destination → rappel de profil (si profil incomplet) → description → boost ou Vos trajets. Les écrans BlaBlaCar d'origine (itinéraire, étapes, points d'arrêt, dates, heure, passagers, réservation instantanée, prix, Zen, retour, assurance) sont sautés : le brouillon garde ses valeurs par défaut (`newDraft` : 1re route, étapes Versailles et Poitiers, 08:00, 3 places, instantanée, 30 €, Zen, sans retour, sans assurance) et la date est le premier jour libre à partir de demain (`firstFreeDay`). Les composants restent dans le code, ils ne sont plus atteignables.
- **Calendrier de publication** (écran sauté en V2) : à partir du lendemain ; jours où un trajet existe déjà grisés (un seul trajet par jour, retour compris).
- **Toasts** : seulement le délai dépassé de l'A3 et la limite de 20 dates. Pas de toast pour les actions hors périmètre (boutons sans effet).
- **Écran Description** : aligné sur DESC TRAJET ; bouton « Publier le trajet » et mention légale fixés en bas de l'écran.
- **Panneau de présentation** : en tête « Noé · BlaBlaCar · Newbie drivers » + mention de la formation Noé. Explications d'écran de **deux lignes maximum**, texte justifié, **aucun tiret** (ni césure, ni « — » dans les titres), **aucune mention de Figma, des US, de SCRUM ou d'écran « créé »**.
- Coordonnées de démo anonymisées : `contact@blablacar-cinco.com`, `+33 6 79 37 XX XX`.

## Architecture

- `src/state/store.tsx` : état global (profil, trajets, brouillon de publication, recherche, réglages de démo) et règles métier (`isComplete`, `needsPreDepartureReminder`, `boostEligible`, `resetProfile`).
- `src/state/router.tsx` : pile d'écrans (`push`, `replace`, `back`, `backTo`, `resetTo`). En développement, le routeur est exposé sur `window.__router` pour les tests (`window.__router.resetTo('results')`).
- `src/app/routes.tsx` : table nom de route → composant + titre du panneau (titres sans tiret, séparateur « : »).
- `src/app/notes.ts` : textes du panneau, par nom de route.
- `src/ui/kit.tsx` : composants communs. `Screen` (en-tête / corps qui défile / pied fixe), `TabBar` (5 colonnes égales, icônes = masques PNG découpés dans la Navbar Figma, `src/assets/tabmask/`), `Avatar` (coche de vérification ronde ajoutée par l'app, identique pour tous).
- `src/assets/` : visuels découpés dans les exports Figma (avatars, photos de Coralie, illustrations, cartes nettoyées de leurs boutons incrustés, logo).
- Couleurs et polices : `src/tokens.css` (bleu `#0066D4`, bleu nuit `#001536`, Poppins pour les titres, Inter pour le texte).

## Organisation du code

```
src/
  App.tsx              assemblage : cadre téléphone, écran courant, toast, panneau de démo
  app/
    PhoneFrame.tsx     cadre Android 360×800 (ordinateur) ou plein écran (mobile), barre système
    DemoPanel.tsx      panneau de présentation
    notes.ts           textes du panneau (explication de chaque écran, parcours)
    routes.tsx         table des écrans (nom de route → composant, titre affiché)
  screens/
    passenger.tsx      accueil, résultats de recherche, fiche conducteur
    publish.tsx        tout le parcours de publication, rappel de profil, description, boost
    profile.tsx        profil, sections modifiables, photo, pièce d'identité
    trips.tsx          Vos trajets, Messages
    shared.tsx         saisie d'adresse, calendrier
  state/
    store.tsx          état de la démo (profil, trajets, recherche, brouillon de publication) et règles métier
    router.tsx         navigation par pile d'écrans (avant, retour, retour à un écran, remise à zéro)
  data/
    drivers.ts         conducteurs de la recherche, règles de l'encart et du badge passager
    places.ts          villes et adresses proposées
    format.ts          dates et heures en français
  ui/kit.tsx           composants communs (écran, boutons, listes, cases, stepper, tab bar, avatar…)
  tokens.css           couleurs et polices
  assets/              photos, illustrations, cartes et icônes de tab bar, découpées dans les maquettes Figma
scripts/
  export-figma.mjs     export des écrans Figma en PNG (référence visuelle) et des icônes de tab bar
```

Stack : Vite, React 19, TypeScript, icônes lucide-react. Pas de backend : tout l'état vit en mémoire dans le navigateur.

## Exporter les visuels depuis Figma

Le fichier Figma « BlaBlaCar 5 » est sur l'offre Starter : son connecteur limite fortement le nombre d'appels. Pour réexporter les écrans de référence, on passe par l'API REST de Figma, en un seul appel :

```bash
node scripts/export-figma.mjs          # écrans de PROTOS en PNG dans design-ref/screens/ (non versionné)
node scripts/export-figma.mjs --icons  # icônes de la tab bar en SVG dans src/assets/tabbar/
```

Le script demande un **token personnel Figma** au lancement (Figma → Settings → Security → Personal access tokens, droit « File content : Read-only ») et ne l'enregistre nulle part.

## Commandes

```bash
npm run dev      # serveur local http://localhost:5173 (config de lancement : .claude/launch.json, nom « prototype »)
npm run build    # tsc -b + vite build → dist/
npx tsc -b       # vérification des types seule
```

Déploiement : `git push` sur `main` → Vercel redéploie automatiquement (≈ 30 à 40 s). Vérifier la mise en ligne en comparant le nom du bundle `assets/index-*.js` de `dist/index.html` avec celui servi par https://noe-prototype-blablacar-cinco.vercel.app. Terminer les messages de commit par la ligne de co-auteur demandée par l'environnement.

## Versions

Chaque version présentée est figée par un **tag** et une **branche** du même nom sur GitHub, puis on continue sur `main`.

| Version | Commit | Adresse figée (publique) |
|---|---|---|
| V1 | `5810d50` | https://noe-prototype-blablacar-cinco-2fm9ixlmk-jeanbaptistekrady-9091.vercel.app |
| V2 | `80d9246` | https://noe-prototype-blablacar-cinco-3ach7ry7k-jeanbaptistekrady-9091.vercel.app |

V2 par rapport à V1 : parcours de publication raccourci (sans les écrans BlaBlaCar ni l'assurance), pièce d'identité en 1 s, photo en 1,5 s, bandeau « Votre photo est en ligne » 3 s puis effacé en douceur, badge et bandeau en bleu, profil sans nom ni date de naissance, badge « Super Passager ».

- L'adresse principale https://noe-prototype-blablacar-cinco.vercel.app ne change jamais et montre toujours la dernière version poussée sur `main` (lien et QR code de la présentation).
- Revoir une version en local : `git checkout tags/v1` puis `npm run dev` ; retour avec `git checkout main`.
- Créer la version suivante (sur demande) : `git tag -a v2 -m "…"`, `git branch v2`, puis `git push origin refs/tags/v2 refs/heads/v2:refs/heads/v2` (tag et branche ont le même nom : préciser `refs/…`, sinon Git refuse).
- Adresse figée : Vercel ne crée pas de déploiement de branche si le commit est déjà déployé. On prend l'adresse du déploiement de production de ce commit via `gh api repos/jbkrady/noe-prototype-blablacar-cinco/deployments` puis `…/deployments/<id>/statuses` (`environment_url`). La protection Vercel (Deployment Protection) a été désactivée par l'utilisateur : ces adresses sont publiques.

## Pièges connus

- **Connecteur Figma (offre Starter)** : bloqué après quelques appels. Pour réexporter, faire lancer par l'utilisateur `node scripts/export-figma.mjs` (API REST, un seul appel, token demandé au lancement). L'option `--icons` écrit des SVG dans `src/assets/tabbar/`, que l'app n'utilise plus (elle utilise `src/assets/tabmask/`).
- **Connecteur Vercel** : n'a pas accès à l'espace personnel `jeanbaptistekrady-9091` (erreur 403). Déployer en poussant sur GitHub.
- **Navigateur intégré** : avec une taille de fenêtre émulée, les clics souris réels peuvent ne pas arriver ; piloter par `element.click()` en JavaScript et vérifier par captures. Les captures prises juste après une navigation montrent souvent l'écran en pleine animation de glissement : attendre ~800 ms.
- **Playwright** : son Chrome n'atteint pas toujours `localhost:5173` ; l'utiliser pour le site en ligne.
- **Conteneurs qui défilent tout seuls** : utiliser `overflow: clip` (et non `hidden`) sur les conteneurs qui ne doivent pas défiler, sinon l'apparition d'un élément (étiquette sur la carte) peut décaler tout l'écran.
- **Mode plein écran mobile** : la classe `device--bare` ne doit pas hériter du style du cadre téléphone (`device`), sinon coins arrondis et marges parasites.
- Le serveur de développement s'arrête parfois entre deux sessions : le relancer avec la configuration « prototype ».
- Python système en 3.9 : pas de `match` ni d'antislash dans les f-strings ; un venv avec Pillow et qrcode existe dans le dossier temporaire de session, pas dans le projet.

## Présentation (hors dépôt)

La slide 12 « 08 / 14 » du deck « Présentation Blabla Car.pptx » contient le lien de la démo et un QR code (fichiers générés dans ~/Downloads). Le rendu des slides se fait en exportant en PDF avec Microsoft PowerPoint via AppleScript (LibreOffice n'est pas installé).
