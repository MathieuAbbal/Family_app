import { Injectable } from '@angular/core';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, OAuthCredential } from 'firebase/auth';
import { ref, get, update } from 'firebase/database';
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

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar');
    provider.addScope('https://www.googleapis.com/auth/drive');

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result) as OAuthCredential | null;
    if (credential?.accessToken) {
      this.googleToken$.next(credential.accessToken);
    }

    const user = result.user;
    const userRef = ref(db, '/users/' + user.uid);

    // Récupérer les données existantes pour ne pas écraser les champs personnalisés
    const snapshot = await get(userRef);
    const existingData = snapshot.val() || {};

    // Construire les données à mettre à jour
    // Utiliser la valeur existante SEULEMENT si elle n'est pas vide
    const existingPhoto = existingData['photoURL'] as string | undefined;
    const existingName = existingData['displayName'] as string | undefined;
    const hasExistingPhoto = existingPhoto && existingPhoto.trim() !== '';
    const hasExistingName = existingName && existingName.trim() !== '';

    const userData: Record<string, string> = {
      email: user.email || '',
      uid: user.uid,
      displayName: hasExistingName ? existingName : (user.displayName || ''),
      photoURL: hasExistingPhoto ? existingPhoto : (user.photoURL || ''),
    };

    await update(userRef, userData);
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
