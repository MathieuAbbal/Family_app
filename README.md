# FamilyApp

Application familiale collaborative construite avec **Angular 21** et **Firebase**. Elle permet aux membres d'une famille de gérer leurs tâches, partager des photos, organiser leurs courses et explorer une carte interactive.

Disponible en tant que **Progressive Web App (PWA)** installable sur mobile et desktop.

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
- Tri par date (plus récentes en premier)
- Notifications via Material Snackbar

### Liste de courses
- Deux listes : articles à acheter et panier
- Drag & drop entre les listes
- Ajout/suppression d'articles

### Carte interactive
- Carte MapLibre GL centrée sur la France
- Recherche d'adresses (Nominatim / OpenStreetMap)
- Géolocalisation de l'utilisateur
- Vue terrain avec relief et ombrage
- Contrôles de navigation, plein écran et boussole

### Gestion des utilisateurs
- Inscription / connexion par email et mot de passe
- Profil éditable (nom, téléphone, photo, date de naissance)
- Upload d'avatar avec compression (400px max)
- Guard d'authentification sur les routes protégées

## Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| Framework | Angular 21.1.2 |
| UI | Angular Material 21 + Tailwind CSS 3 |
| Backend | Firebase (Auth, Realtime Database, Storage) |
| Carte | MapLibre GL 1.15 + Geocoder |
| Éditeur | TinyMCE Angular 7 |
| PWA | Angular Service Worker |
| Langage | TypeScript 5.8 |
| Tests | Karma + Jasmine |

## Structure du projet

```
src/app/
├── dialogs/                  # Dialogues (upload photo, confirmation)
├── header/                   # En-tête de l'application
├── home/                     # Page d'accueil (dashboard kanban)
├── layout/
│   ├── bottom-nav/           # Navigation mobile (bas d'écran)
│   ├── sidebar/              # Navigation desktop (barre latérale)
│   └── top-bar/              # Barre supérieure mobile
├── map/                      # Carte interactive MapLibre
├── models/                   # Modèles de données (Task, Photo, User, Item, Comment)
├── photo/                    # Galerie photos avec interactions sociales
├── services/                 # Services (auth, tasks, photos, items, comments, kanban)
├── shopping/                 # Liste de courses avec drag & drop
├── tasks/
│   ├── add-task/             # Formulaire de création de tâche
│   ├── edit-task/            # Formulaire d'édition de tâche
│   └── kanban/               # Board kanban
└── user/
    ├── auth/
    │   ├── signin/           # Page de connexion
    │   └── signup/           # Page d'inscription
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

### Build de production

```bash
ng build
```

Les fichiers sont générés dans `dist/familyapp/`.

## Configuration Firebase

Le projet utilise Firebase avec les services suivants :
- **Authentication** : connexion email/mot de passe
- **Realtime Database** : stockage des tâches, photos, articles, utilisateurs, commentaires
- **Cloud Storage** : stockage des photos et avatars

La configuration se trouve dans `src/app/firebase.ts`.

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
