@echo off
echo Starting APK build...
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\Mathieu\AppData\Local\Android\Sdk"
cd /d "c:\code\Mes projets\Family_app\android"
echo Current dir: %CD%
dir gradlew.bat
echo Running gradlew...
call "c:\code\Mes projets\Family_app\android\gradlew.bat" assembleDebug
echo Build exit code: %ERRORLEVEL%
