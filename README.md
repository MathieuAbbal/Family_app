# FamilyApp

Application familiale collaborative construite avec **Angular 21** et **Firebase**. Elle permet aux membres d'une famille de gérer leurs tâches, partager des photos, organiser leurs courses, partager des documents et se localiser sur une carte interactive.

Disponible en tant que **Progressive Web App (PWA)** installable sur mobile et desktop, et en tant qu'**application Android native** via Capacitor.

## Fonctionnalités

### Tableau de bord Kanban
- Board avec 5 colonnes : Nouveau, En cours, Fait, Bloqué, Archivé
- Drag & drop entre les colonnes (Angular CDK)
- Création/édition de tâches avec éditeur rich text (TinyMCE)
- Niveaux d'urgence colorés (Urgent, Relativement urgent, Pas urgent)
- Attribution des tâches à un ou plusieurs membres (multi-assignation)

### Fil d'actu (Feed social)
- Publications avec texte et/ou images
- Système de likes et commentaires
- Affichage de l'auteur (nom + avatar) et date/heure
- Tri par date (plus récents en premier, style feed)
- Suppression de ses propres posts avec confirmation
- Séparateurs de date automatiques
- **Notifications push** : alerte native quand un membre publie (même app fermée)

### Listes de courses (multi-listes)
- Plusieurs listes de courses avec onglets (ex: Courses, Maison, Fête...)
- Articles groupés par catégorie (Fruits & Légumes, Produits laitiers, Viandes, Épicerie, Boissons, Surgelés, Hygiène, Autre)
- Quantité par article
- Case à cocher pour marquer les articles achetés
- Section "Dans le panier" pour les articles cochés
- Auteur de chaque article affiché
- Migration automatique depuis l'ancienne liste unique

### Recettes
- Carnet de recettes familial
- Ingrédients par catégorie avec quantités
- Ajout des ingrédients d'une recette directement dans une liste de courses
- Multiplicateur de portions (ajustement automatique des quantités)

### Carte interactive
- Carte MapLibre GL centrée sur la France
- Géolocalisation en temps réel de tous les membres de la famille
- Marqueurs avec avatar (bordure bleue = soi-même, bordure rose = autres membres)
- Popup avec nom et heure de dernière mise à jour
- Centrage automatique sur sa position au chargement
- Recherche d'adresses (Nominatim / OpenStreetMap)
- Contrôles de navigation, plein écran et boussole

### Documents partagés (Google Drive)
- Dossier familial partagé sur Google Drive
- Navigation complète avec fil d'Ariane (breadcrumb)
- Création, renommage et suppression de dossiers
- Upload de fichiers avec auteur affiché
- Drag & drop pour déplacer les fichiers dans les dossiers
- Aperçu des fichiers via lien Google Drive
- Icônes par type de fichier (PDF, images, documents, tableurs...)

### Calendrier partagé (Google Calendar)
- Intégration avec Google Calendar
- Affichage des événements de tous les calendriers
- Création d'événements (journée entière ou avec horaires)
- Sélection de l'agenda cible (personnel, famille...)
- Vue mensuelle avec numéros de semaine

### Vacances
- Planification des vacances familiales
- Filtrage par statut : à venir, en cours, passées
- Checklist de préparation par voyage
- Album photos par destination
- Carte interactive avec localisation

### Dialogues de confirmation
- Confirmation avant chaque suppression (publications, commentaires, articles, événements, vacances, photos, checklist)
- Composant partagé `ConfirmDialogComponent` via Angular Material Dialog
- Boutons Non/Oui avec feedback snackbar après suppression

### Gestion des utilisateurs
- Connexion via Google (OAuth2)
- Profil éditable (nom, téléphone, photo, date de naissance)
- Upload d'avatar avec compression (400px max)
- Guard d'authentification sur les routes protégées

### Notifications push (FCM)
- Notifications push via Firebase Cloud Messaging
- Alerte native du navigateur/mobile quand un membre publie dans le chat
- Fonctionne même avec l'application fermée (Service Worker)
- Snackbar avec action "Voir" quand l'app est au premier plan
- Nettoyage automatique des tokens invalides

### PWA & Mises à jour
- Notification toast automatique quand une nouvelle version est disponible
- Rechargement en un clic pour appliquer la mise à jour

### Application Android native (Capacitor)
- APK générable via Capacitor 8 pour sideloading
- Même codebase Angular que la PWA
- Build automatisé via script `build-apk.bat`

## Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| Framework | Angular 21.1.2 |
| UI | Angular Material 21 + Tailwind CSS 3 |
| Backend | Firebase (Auth, Realtime Database, Storage, Cloud Functions, Cloud Messaging) |
| APIs Google | Calendar API, Drive API |
| Carte | MapLibre GL 5.17 + Geocoder |
| Éditeur | TinyMCE Angular 7 |
| PWA | Angular Service Worker |
| Mobile natif | Capacitor 8 (Android) |
| Hébergement | GitHub Pages |
| Langage | TypeScript 5.8 |

## Structure du projet

```
src/app/
├── calendar/                 # Calendrier Google Calendar
│   ├── add-event-dialog/     # Dialogue création événement
│   └── event-detail-dialog/  # Dialogue détail événement
├── chat/                     # Fil d'actu (feed social)
├── documents/                # Documents partagés (Google Drive)
├── home/                     # Page d'accueil
├── layout/
│   ├── bottom-nav/           # Navigation mobile (bas d'écran)
│   ├── sidebar/              # Navigation desktop (barre latérale)
│   └── top-bar/              # Barre supérieure mobile
├── map/                      # Carte interactive avec géolocalisation famille
├── dialogs/
│   └── confirm-dialog/       # Dialogue de confirmation partagé (suppression)
├── models/                   # Modèles de données (Task, Message, User, ShoppingItem, ShoppingList, Recipe, Comment)
├── recipes/                  # Carnet de recettes familial
├── services/                 # Services (auth, tasks, chat, shopping, recipes, google-drive, google-calendar, location, notification)
├── shopping/                 # Listes de courses multi-listes
├── tasks/
│   ├── add-task/             # Formulaire de création de tâche
│   ├── edit-task/            # Formulaire d'édition de tâche
│   └── kanban/               # Board kanban
├── vacances/                 # Gestion des vacances famille
└── user/
    ├── auth/
    │   └── signin/           # Page de connexion Google
    ├── user-avatar/          # Composant avatar
    └── user-profile/         # Page de profil utilisateur
```

```
functions/                       # Firebase Cloud Functions
├── src/
│   └── index.ts                 # Trigger notification push sur nouveau message chat
├── package.json
└── tsconfig.json
```

```
android/                         # Application Android native (Capacitor)
├── app/
│   ├── src/main/assets/public/  # Build Angular copié ici par cap sync
│   └── build.gradle             # Config Gradle de l'app
├── build.gradle                 # Config Gradle racine
└── gradlew.bat                  # Wrapper Gradle
```

## Installation

### Prérequis

- Node.js 18+
- npm 10+

### Démarrage

```bash
# Installer les dépendances
npm install --legacy-peer-deps

# Lancer le serveur de développement
ng serve
```

L'application est accessible sur `http://localhost:4200/`.

### Cloud Functions (notifications push)

```bash
# Installer les dépendances
cd functions && npm install

# Build
npm run build

# Déployer
firebase deploy --only functions
```

### Déploiement GitHub Pages

```bash
npm run deploy
```

### Build APK Android

```bash
# Prérequis : Android Studio installé (fournit le JDK et le SDK Android)

# Build Angular + sync Capacitor + générer l'APK
ng build --configuration production
npx cap sync android
build-apk.bat

# L'APK est généré dans :
# android/app/build/outputs/apk/debug/app-debug.apk
```

## Configuration Firebase

Pour faire tourner l'application, vous devez créer votre propre projet Firebase et configurer les services nécessaires.

### 1. Créer un projet Firebase

1. Rendez-vous sur [console.firebase.google.com](https://console.firebase.google.com)
2. Cliquez sur **Ajouter un projet** et suivez les étapes
3. Activez les services suivants dans la console Firebase :
   - **Authentication** : activez le fournisseur **Google** (Authentication > Sign-in method > Google)
   - **Realtime Database** : créez une base de données (choisissez la région `europe-west1` pour l'Europe)
   - **Cloud Storage** : activez le stockage pour les images

### 2. Récupérer la configuration Firebase

1. Dans la console Firebase, allez dans **Paramètres du projet** (icône engrenage) > **Général**
2. Dans la section **Vos applications**, cliquez sur l'icône **Web** (`</>`) pour ajouter une app web
3. Copiez l'objet `firebaseConfig` généré

### 3. Configurer l'application

Créez ou modifiez le fichier `src/app/firebase.ts` avec votre configuration :

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJET.firebaseapp.com",
  databaseURL: "https://VOTRE_PROJET-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "VOTRE_PROJET",
  storageBucket: "VOTRE_PROJET.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
```

### 4. Configurer les Security Rules

Les règles de sécurité sont définies dans `database.rules.json` avec des permissions granulaires par noeud :
- Lecture authentifiée sur toutes les données
- Écriture restreinte au propriétaire pour `/users/{uid}` et `/locations/{uid}`
- Écriture authentifiée pour les données partagées (chat, shopping, tasks, etc.)

```bash
# Déployer les règles
firebase deploy --only database
```

### 5. Restreindre les domaines autorisés

Dans Firebase Console > Authentication > Settings > Domaines autorisés, ajoutez uniquement vos domaines :
- `localhost`
- `votre-projet.firebaseapp.com` (défaut)
- `votre-projet.web.app` (défaut)
- `votre-utilisateur.github.io` (si déployé sur GitHub Pages)

### 6. Restreindre la clé API (recommandé)

Dans [Google Cloud Console](https://console.cloud.google.com) > APIs & Services > Credentials :
- Sélectionnez votre clé API (Browser key)
- Choisissez **Restrictions relatives aux applications** > **Sites Web**
- Ajoutez les référents HTTP autorisés :
  ```
  http://localhost:4200/*
  https://votre-utilisateur.github.io/*
  https://votre-projet.firebaseapp.com/*
  https://votre-projet.web.app/*
  ```
- Laissez **Ne pas restreindre la clé** pour les restrictions relatives aux API (Firebase utilise plusieurs APIs)
- Cliquez sur **Enregistrer**

> **Note** : Les domaines Firebase (`firebaseapp.com` / `web.app`) sont nécessaires pour que le flow d'authentification Google OAuth fonctionne correctement.

## Sécurité

Les clés Firebase sont des identifiants **client-side** visibles dans le code source. C'est normal et par design. La sécurité repose sur 3 couches :

| Protection | Rôle |
|---|---|
| **Firebase Security Rules** (`auth != null`) | Seuls les utilisateurs connectés peuvent lire/écrire dans la base |
| **Domaines autorisés** (Firebase Auth) | Seuls vos domaines peuvent initier une connexion Google |
| **Restriction HTTP referrer** (Google Cloud) | La clé API ne fonctionne que depuis vos domaines autorisés |

## APIs Google (optionnel)

Pour les fonctionnalités Calendrier et Documents, vous devez configurer :

- **Google Calendar API** : activez l'API dans la Google Cloud Console
- **Google Drive API** : activez l'API dans la Google Cloud Console

Configurez les scopes OAuth dans `src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  googleCalendar: {
    apiKey: 'VOTRE_GOOGLE_API_KEY',
    clientId: 'VOTRE_CLIENT_ID.apps.googleusercontent.com',
    discoveryDocs: [
      'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
      'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
    ],
    scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive',
    familyCalendarId: 'VOTRE_CALENDAR_ID@group.calendar.google.com',
    familyDriveFolderId: 'VOTRE_DRIVE_FOLDER_ID'
  }
};
```

## PWA

L'application est configurée comme Progressive Web App :
- Service Worker activé en production (Angular ngsw + FCM)
- Notifications push via Firebase Cloud Messaging
- Manifest avec icônes (72x72 à 512x512)
- Mode plein écran
- Cache offline des assets

## Design

- **Mobile-first** : navigation en bas d'écran sur mobile, sidebar sur desktop
- **Thème** : palette personnalisée (rose, corail, orange, violet) avec polices Nunito / Inter
- **Angular Material** : dialogues, snackbars, composants de formulaire
- **Tailwind CSS** : utilitaires, layout responsive, animations de transition
