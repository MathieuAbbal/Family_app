import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EditProfileService {

  constructor() { }

  getUserData(): Observable<any> {
    return new Observable((observer) => {
      const unsubscribe = firebase.auth().onAuthStateChanged(
        (user) => {
          if (user) {
            // L'utilisateur est connecté, récupérez les données supplémentaires depuis la Realtime Database
            firebase.database().ref('/users/' + user.uid).once('value').then((snapshot) => {
              const userData = snapshot.val();
              observer.next(userData); 
            }).catch((error) => {
              observer.error(error);
            });
          } else {
            // L'utilisateur n'est pas connecté
            observer.next(null);
          }
        },
        (error) => {
          observer.error(error);
        },
        () => {
          observer.complete();
        }
      );
      // Retourne la fonction de désinscription pour nettoyer lors de la désinscription
      return unsubscribe;
    });
  }
  updateUserData(uid: string, data: any): Promise<void> {
    return firebase.database().ref(`/users/${uid}`).update(data);
  }


  uploadFile(file: File) {
    return new Promise((resolve, reject) => {
      const almostUniqueFileName = Date.now().toString();
      const upload = firebase
        .storage()
        .ref()
        .child('photos/user/' + almostUniqueFileName + file.name)
        .put(file);
      upload.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {
          console.log('Chargement…');
        },
        (error) => {
          console.log('Erreur de chargement ! : ' + error);
          reject();
        },
        () => {
          resolve(upload.snapshot.ref.getDownloadURL());
        }
      );
    });
  }
}
