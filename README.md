# BlaBlaCar · Newbie drivers — prototype interactif

Prototype réalisé dans le cadre de la **formation Product Manager de Noé**. Ce n'est pas une application officielle BlaBlaCar.

Application mobile (Android, 360×800) qui illustre les user stories du projet « newbie drivers » :
compléter son profil pendant la publication d'un trajet, vérification de la photo in-app, rappel avant départ,
bonnes pratiques de description, encart des nouveaux conducteurs dans la recherche et badge d'historique passager.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5173 — sur ordinateur, l'app s'affiche dans un cadre de téléphone avec un panneau de présentation ; sur mobile, en plein écran.

## Construire

```bash
npm run build
```

Le site statique est généré dans `dist/` (déployable tel quel, par exemple sur Vercel : framework « Vite », commande `npm run build`, dossier `dist`).

## Stack

Vite · React · TypeScript. Maquettes de référence : Figma « BlaBlaCar 5 ».
