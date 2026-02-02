# FamilyApp

Application familiale collaborative construite avec **Angular 21** et **Firebase**. Elle permet aux membres d'une famille de gérer leurs tâches, partager des photos, organiser leurs courses, partager des documents et se localiser sur une carte interactive.

Disponible en tant que **Progressive Web App (PWA)** installable sur mobile et desktop.

**URL** : https://mathieuabbal.github.io/Family_app/

## Fonctionnalités

### Tableau de bord Kanban
- Board avec 5 colonnes : Nouveau, En cours, Fait, Bloqué, Archivé
- Drag & drop entre les colonnes (Angular CDK)
- Création/édition de tâches avec éditeur rich text (TinyMCE)
- Niveaux d'urgence colorés (Urgent, Relativement urgent, Pas urgent)
- Attribution des tâches aux membres de la famille

### Galerie photos
- Upload de photos avec compression automatique (1200px max, JPEG 70%)
- Système de likes et commentaires par photo
- Affichage de l'auteur (nom + avatar) et date de publication
- Tri par date (plus récentes en premier)

### Liste de courses
- Articles groupés par catégorie (Fruits & Légumes, Produits laitiers, Viandes, Épicerie, Boissons, Surgelés, Hygiène, Autre)
- Quantité par article
- Case à cocher pour marquer les articles achetés
- Section "Dans le panier" pour les articles cochés
- Auteur de chaque article affiché

### Carte interactive
- Carte MapLibre GL centrée sur la France
- Géolocalisation en temps réel de tous les membres de la famille
- Marqueurs avec avatar (bordure bleue = soi-même, bordure rose = autres membres)
- Popup avec nom et heure de dernière mise à jour
- Centrage automatique sur sa position au chargement
- Recherche d'adresses (Nominatim / OpenStreetMap)
- Contrôles de navigation, plein écran et boussole

### Documents partagés (Google Drive)
- Upload de fichiers vers un dossier partagé "FamilyApp" sur Google Drive
- Catégories : Santé, École, Administratif, Recettes, Autre
- Liste des fichiers groupés par catégorie
- Aperçu des fichiers via lien Google Drive
- Auteur et date d'upload affichés
- Suppression de fichiers

### Calendrier partagé (Google Calendar)
- Intégration avec Google Calendar
- Affichage des événements familiaux

### Gestion des utilisateurs
- Connexion via Google (OAuth2)
- Profil éditable (nom, téléphone, photo, date de naissance)
- Upload d'avatar avec compression (400px max)
- Guard d'authentification sur les routes protégées

## Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| Framework | Angular 21.1.2 |
| UI | Angular Material 21 + Tailwind CSS 3 |
| Backend | Firebase (Auth, Realtime Database, Storage) |
| APIs Google | Calendar API, Drive API |
| Carte | MapLibre GL 1.15 + Geocoder |
| Éditeur | TinyMCE Angular 7 |
| PWA | Angular Service Worker |
| Hébergement | GitHub Pages |
| Langage | TypeScript 5.8 |

## Structure du projet

```
src/app/
├── calendar/                 # Calendrier Google Calendar
├── dialogs/                  # Dialogues (upload photo, confirmation)
├── documents/                # Documents partagés (Google Drive)
├── header/                   # En-tête de l'application
├── home/                     # Page d'accueil (dashboard kanban)
├── layout/
│   ├── bottom-nav/           # Navigation mobile (bas d'écran)
│   ├── sidebar/              # Navigation desktop (barre latérale)
│   └── top-bar/              # Barre supérieure mobile
├── map/                      # Carte interactive avec géolocalisation famille
├── models/                   # Modèles de données (Task, Photo, User, Item, Comment)
├── photo/                    # Galerie photos avec interactions sociales
├── services/                 # Services (auth, tasks, photos, items, comments, kanban, location, google-drive, google-auth)
├── shopping/                 # Liste de courses par catégorie
├── tasks/
│   ├── add-task/             # Formulaire de création de tâche
│   ├── edit-task/            # Formulaire d'édition de tâche
│   └── kanban/               # Board kanban
└── user/
    ├── auth/
    │   └── signin/           # Page de connexion Google
    ├── user-avatar/          # Composant avatar
    └── user-profile/         # Page de profil utilisateur
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

### Déploiement GitHub Pages

```bash
npm run deploy
```

## Configuration Firebase

Le projet utilise Firebase avec les services suivants :
- **Authentication** : connexion Google OAuth2
- **Realtime Database** : stockage des tâches, photos, articles, utilisateurs, commentaires, positions
- **Cloud Storage** : stockage des photos et avatars

La configuration se trouve dans `src/app/firebase.ts`.

## APIs Google

- **Google Calendar API** : calendrier familial partagé
- **Google Drive API** : dossier de documents partagé

Les scopes OAuth sont configurés dans `src/environments/environment.ts`.

## PWA

L'application est configurée comme Progressive Web App :
- Service Worker activé en production
- Manifest avec icônes (72x72 à 512x512)
- Mode plein écran
- Cache offline des assets

## Design

- **Mobile-first** : navigation en bas d'écran sur mobile, sidebar sur desktop
- **Thème** : palette personnalisée (rose, corail, orange, violet) avec polices Nunito / Inter
- **Angular Material** : dialogues, snackbars, composants de formulaire
- **Tailwind CSS** : utilitaires, layout responsive, animations de transition
