import { Injectable } from '@angular/core';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, OAuthCredential } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { User } from '../models/user.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** Emits the Google OAuth access token after sign-in */
  googleToken$ = new Subject<string>();

  /** Resolves immediately (kept for guard compatibility) */
  redirectReady: Promise<void> = Promise.resolve();

  constructor() { }

  signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar');
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    return signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result) as OAuthCredential | null;
        if (credential?.accessToken) {
          this.googleToken$.next(credential.accessToken);
        }
        const user = result.user;
        return set(ref(db, '/users/' + user.uid), {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
        }).then(() => {});
      });
  }

  signOutUser() {
    signOut(auth);
  }

  allUsers: User[] = [];

  getAllUsers(): Promise<User[]> {
    return get(ref(db, '/users')).then(snapshot => {
      const usersObject = snapshot.val();
      if (usersObject) {
        this.allUsers = Object.keys(usersObject).map(key => ({ id: key, ...usersObject[key] })) as User[];
      } else {
        this.allUsers = [];
      }
      return this.allUsers;
    });
  }
}
