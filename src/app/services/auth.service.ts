import { Injectable } from '@angular/core';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
  createNewUser(email: string, password: string) {
    return new Promise<void>(
      (resolve, reject) => {
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            return set(ref(db, '/users/' + user.uid), {
              email: user.email,
              uid: user.uid
            });
          })
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      }
    );
  }

  signInUser(email: string, password: string) {
    return new Promise<void>(
      (resolve, reject) => {
        signInWithEmailAndPassword(auth, email, password).then(
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
    signOut(auth);
  }
  allUsers: any[] = [];
  getAllUsers() {
    return new Promise((resolve, reject) => {
      const dbRef = ref(db, '/users');
      get(dbRef)
        .then(snapshot => {
          const usersObject = snapshot.val();
          if (usersObject) {
            this.allUsers = Object.keys(usersObject).map(key => ({ id: key, ...usersObject[key] }));
          } else {
            this.allUsers = [];
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
