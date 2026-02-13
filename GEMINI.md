# 🤖 Projet Happy Day - Documentation pour Gemini

Ce fichier contient toutes les informations nécessaires pour comprendre l'architecture, la logique et les conventions de ce projet Nuxt 3/4.

## 📝 Présentation du Projet
**Happy Day** est une application web interactive offrant une expérience immersive (musique, ambiance visuelle et sonore) autour de messages et de citations vocales de différents personnages.

## 🚀 Stack Technique
- **Framework** : Nuxt 4 (via `compatibilityVersion: 4`)
- **Langage** : TypeScript
- **Style** : CSS standard (scoped et global), design hybride entre "Pixel Art/Retro" et "Glassmorphism".
- **Module** : `@nuxtjs/color-mode` pour la gestion des thèmes clair/sombre.

## 📂 Structure du Projet
- `app/app.vue` : Racine de l'application. Gère la musique de fond globale et les contrôles de volume maîtres.
- `app/pages/` :
  - `index.vue` : Page d'accueil.
  - `cosmos.vue` : Page d'ambiance "Bar" avec un chat interactif et un lecteur de citations pour "Asuu".
  - `profile/[id].vue` : Pages de profil dynamiques avec visualiseur audio (Canvas API).
  - `surprise.vue` : Page d'easter egg / surprise.
- `app/composables/useQuotes.ts` : Logique de sélection aléatoire des citations, gestion des messages "déjà vus" via le `localStorage`.
- `assets/data/quotes.json` : Base de données des citations (fichiers audio, avatars, noms).
- `public/` : Contient tous les fichiers statiques (images `.jpg`, musique `.mp3`).

## 🔊 Gestion du Son (Architecture Master/Local)
L'application utilise une gestion de volume segmentée via Nuxt `useState` pour la persistance entre les pages :

### 1. États Globaux (`useState`)
- `bgMusicVolume` : Volume de la musique de fond (`music.mp3`).
- `sfxVolume` : Volume des effets d'ambiance (ex: `bar.mp3` dans Cosmos).
- `voiceVolume` : Volume des voix/citations (🎙️).
- `isGlobalMuted` : État muet pour Musique + SFX (n'affecte pas les Voix).

### 2. Interface de Contrôle
- **Global (Haut à droite)** : Menu escamotable (hover) avec deux sliders horizontaux pour la musique et les effets.
- **Local (Lecteurs Audio)** : Icône micro avec slider **vertical** escamotable (hover) pour ajuster le volume des voix.

### 3. Persistance
Toutes les valeurs de volume sont synchronisées dans le `localStorage` pour persister après un rafraîchissement.

## 🧩 Logique de Données (Quotes)
Les citations sont organisées par `profileId` dans `quotes.json`.
Le composable `useQuotes(profileId)` :
1. Charge les données du profil.
2. Assure un tirage aléatoire sans répétition immédiate (stockage des index vus dans le `localStorage`).
3. Fournit une fonction `getNextQuote()` pour passer au message suivant.

## 🎨 Conventions de Style
- **Variables CSS** : Définies principalement dans les fichiers de pages (mode local) ou dans `app.vue`.
- **Animations** : Utilisation intensive de `@keyframes` pour les éléments interactifs (chats, modales, sliders).
- **Responsive** : Design principalement conçu pour une expérience plein écran (`100vh/100vw`).

## 🛠 Commandes Utiles
- `npm run dev` : Lancer le serveur de développement.
- `npm run build` : Préparer la production.
- `npm run generate` : Génération statique complète.
