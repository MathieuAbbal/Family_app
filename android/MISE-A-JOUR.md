# Mise a jour de FamilyApp (APK)

## Pour le developpeur : generer un nouvel APK

### Methode rapide (script automatique)

```bash
# Depuis la racine du projet
ng build --configuration production
npx cap sync android
build-apk.bat
```

L'APK est genere dans :
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Methode detaillee

```bash
# 1. Build Angular en production
ng build --configuration production

# 2. Copier le build dans le projet Android
npx cap sync android

# 3. Generer l'APK (necessite JAVA_HOME et ANDROID_HOME)
cd android
gradlew.bat assembleDebug
```

### Envoyer l'APK a la famille

Gmail et Google Drive bloquent les fichiers APK. Alternatives :
- **Telegram** : envoyer en message a soi-meme ou dans un groupe
- **WhatsApp** : envoyer en piece jointe
- **USB** : brancher le telephone et copier dans le dossier Download
- **Bluetooth / Nearby Share** : transfert direct PC vers telephone

---

## Pour les membres de la famille : installer la mise a jour

1. Recupere le nouveau fichier `app-debug.apk`
2. Ouvre-le sur ton telephone
3. Appuie sur **Installer** (ou **Mettre a jour**)
4. L'ancienne version est remplacee automatiquement
5. Tes donnees sont conservees (connexion Google, preferences)

> Pas besoin de desinstaller l'ancienne version. Android detecte que c'est la meme app et fait la mise a jour par-dessus.

## Incrementer la version (optionnel)

Pour suivre les versions, modifier dans `android/app/build.gradle` :

```gradle
defaultConfig {
    versionCode 2        // incrementer a chaque mise a jour
    versionName "1.1"    // version affichee
}
```
