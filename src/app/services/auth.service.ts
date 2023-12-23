import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
  createNewUser(email: string, password: string) {
    return new Promise<void>(
      (resolve, reject) => {
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            // L'utilisateur a été créé dans Firebase Authentication
            // Maintenant, enregistrez les informations supplémentaires dans la Realtime Database
            const user = userCredential.user;
            return firebase.database().ref('/users/' + user.uid).set({
              email: user.email,
              uid: user.uid
            });
          })
          .then(() => {
            // Les données de l'utilisateur sont enregistrées dans la Realtime Database
            resolve();
          })
          .catch((error) => {
            // Gérer les erreurs
            reject(error);
          });
      }
    );
  }

  signInUser(email: string, password: string) {
    return new Promise<void>(
      (resolve, reject) => {
        firebase.auth().signInWithEmailAndPassword(email, password).then(
          () => {
            resolve();
          },
          (error: any) => {
            reject(error);
          }
        );
      }
    );
  }
  signOutUser() {
    firebase.auth().signOut();
  }
  allUsers: any[] = [];
  getAllUsers() {
    return new Promise((resolve, reject) => {
      const dbRef = firebase.database().ref('/users');
      dbRef.once('value')
        .then(snapshot => {
          const usersObject = snapshot.val(); // Ceci est un objet
          if (usersObject) {
            // Transformer l'objet en tableau
            this.allUsers = Object.keys(usersObject).map(key => ({ id: key, ...usersObject[key] }));
          } else {
            this.allUsers = []; // Aucun utilisateur, donc on initialise un tableau vide
          }
          console.log("Utilisateurs récupérés : ", this.allUsers);
          resolve(this.allUsers);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  

}

