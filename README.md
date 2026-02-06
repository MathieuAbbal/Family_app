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

### Fil d'actu (Feed social)
- Publications avec texte et/ou images
- Système de likes et commentaires
- Affichage de l'auteur (nom + avatar) et date/heure
- Tri par date (plus récents en premier, style feed)
- Suppression de ses propres posts avec confirmation
- Séparateurs de date automatiques

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
├── models/                   # Modèles de données (Task, Message, User, ShoppingItem, Comment)
├── services/                 # Services (auth, tasks, chat, shopping, google-drive, google-calendar, location)
├── shopping/                 # Liste de courses par catégorie
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
- **Realtime Database** : stockage des tâches, messages (fil d'actu), articles, utilisateurs, vacances, positions
- **Cloud Storage** : stockage des images (fil d'actu, vacances, avatars)

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
