# Configuration Android Studio (premiere fois)

Guide pour installer et configurer Android Studio afin de generer l'APK FamilyApp.

## 1. Installer Android Studio

1. Telecharge Android Studio depuis https://developer.android.com/studio
2. Lance l'installeur et suis les etapes par defaut
3. Installe dans le dossier par defaut (`C:\Program Files\Android\Android Studio`)

## 2. Premier lancement - Installation du SDK

Au premier lancement, Android Studio demande un SDK Android :

1. Quand il demande le **Android SDK Location**, entre ce chemin :
   ```
   C:\Users\<TON_NOM>\AppData\Local\Android\Sdk
   ```
   (Remplace `<TON_NOM>` par ton nom d'utilisateur Windows)

2. Si le dossier n'existe pas, cree-le manuellement :
   - Ouvre l'Explorateur de fichiers
   - Va dans `C:\Users\<TON_NOM>\AppData\Local\`
   - Cree le dossier `Android` puis `Sdk` dedans

3. Clique **Next** — Android Studio va telecharger automatiquement :
   - Android SDK Platform (derniere version)
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android Emulator

4. Attends la fin du telechargement puis clique **Finish**

## 3. Ouvrir le projet FamilyApp

1. Dans Android Studio, clique **Open**
2. Navigue jusqu'au dossier :
   ```
   c:\code\Mes projets\Family_app\android
   ```
3. Clique **OK**
4. Attends que **Gradle Sync** finisse (barre de progression en bas)
   - La premiere fois, ca peut prendre plusieurs minutes (telechargement des dependances)

> Si Android Studio propose une mise a jour du Gradle Plugin (AGP), clique **Update** et laisse faire.

## 4. Generer l'APK depuis Android Studio

1. Attends que la barre de progression en bas disparaisse (Gradle sync termine)
2. Va dans le menu : **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
3. Attends la fin du build
4. Une notification apparait en bas a droite avec un lien **locate** — clique dessus pour ouvrir le dossier contenant l'APK

L'APK se trouve dans :
```
android\app\build\outputs\apk\debug\app-debug.apk
```

## 5. Alternative : generer l'APK en ligne de commande

Si tu preferes ne pas utiliser l'interface Android Studio, un script est fourni :

```bash
# Depuis la racine du projet Family_app
build-apk.bat
```

Ce script configure automatiquement les chemins Java (JDK) et Android SDK puis lance le build Gradle.

### Prerequis pour le script

Le script `build-apk.bat` utilise ces chemins par defaut :
```
JAVA_HOME = C:\Program Files\Android\Android Studio\jbr
ANDROID_HOME = C:\Users\Mathieu\AppData\Local\Android\Sdk
```

Si ton installation est differente, modifie les chemins dans `build-apk.bat`.

## 6. Tester sur l'emulateur (optionnel)

Pour previsualisuer l'app sans telephone :

1. Dans Android Studio, clique sur **Device Manager** (icone telephone a droite, ou **Tools** > **Device Manager**)
2. Clique **Create Virtual Device**
3. Choisis un modele (ex: **Pixel 7**) puis **Next**
4. Telecharge une image systeme (ex: **API 36** ou la derniere disponible) puis **Next**
5. Clique **Finish**
6. De retour dans Device Manager, clique le bouton **Play** (triangle) sur ton appareil virtuel
7. L'emulateur demarre — puis clique le bouton **Run** (triangle vert) en haut d'Android Studio pour lancer l'app

> L'emulateur peut etre lent au premier demarrage. Les lancements suivants seront plus rapides.

## Rappel de la structure

```
Family_app/
├── src/                    # Code Angular (modifie ici)
├── android/                # Projet Android (genere par Capacitor)
├── build-apk.bat           # Script de build APK automatique
├── capacitor.config.ts     # Config Capacitor
└── package.json            # Dependances Angular
```

## Workflow de developpement

```
Code Angular (src/)
      |
      v
ng build --configuration production    <- Build Angular
      |
      v
npx cap sync android                  <- Copie dans android/
      |
      v
build-apk.bat                         <- Genere l'APK
      |
      v
android/app/build/outputs/apk/debug/app-debug.apk
```
