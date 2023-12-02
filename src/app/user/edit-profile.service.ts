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
}
