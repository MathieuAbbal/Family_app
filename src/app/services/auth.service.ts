import { Injectable } from '@angular/core';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, OAuthCredential } from 'firebase/auth';
import { ref, get, update } from 'firebase/database';
import { User } from '../models/user.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** Emits the Google OAuth access token after sign-in */
  googleToken$ = new Subject<string>();

  /** Resolves when redirect result is processed (for Capacitor) */
  redirectReady: Promise<void>;

  /** Détecte Android WebView (Capacitor charge depuis une URL distante, donc window.Capacitor n'existe pas) */
  private isAndroidWebView = /Android/.test(navigator.userAgent) && /wv/.test(navigator.userAgent);

  constructor() {
    this.redirectReady = this.handleRedirectResult();
  }

  private async handleRedirectResult(): Promise<void> {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result) as OAuthCredential | null;
        if (credential?.accessToken) {
          this.googleToken$.next(credential.accessToken);
        }
        await this.saveUserData(result.user);
      }
    } catch (e) {
      console.error('Redirect result error:', e);
    }
  }

  private async saveUserData(user: import('firebase/auth').User): Promise<void> {
    const userRef = ref(db, '/users/' + user.uid);
    const snapshot = await get(userRef);
    const existingData = snapshot.val() || {};

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

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar');
    provider.addScope('https://www.googleapis.com/auth/drive');

    if (this.isAndroidWebView) {
      // Redirect flow pour Android WebView (Capacitor)
      await signInWithRedirect(auth, provider);
    } else {
      // Popup flow pour le web
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result) as OAuthCredential | null;
      if (credential?.accessToken) {
        this.googleToken$.next(credential.accessToken);
      }
      await this.saveUserData(result.user);
    }
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
