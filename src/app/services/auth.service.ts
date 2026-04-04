import { Injectable } from '@angular/core';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut, OAuthCredential } from 'firebase/auth';
import { ref, get, update } from 'firebase/database';
import { User } from '../models/user.model';
import { Subject } from 'rxjs';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** Emits the Google OAuth access token after sign-in */
  googleToken$ = new Subject<string>();
  private socialLoginInitialized = false;

  constructor(private platform: PlatformService) {
    if (this.platform.isNative()) {
      this.initSocialLogin();
    }
  }

  private async initSocialLogin(): Promise<void> {
    try {
      const { SocialLogin } = await import('@capgo/capacitor-social-login');
      await SocialLogin.initialize({
        google: {
          webClientId: '728695329604-70417p57psoofhqlsio6qjv705a0ieqf.apps.googleusercontent.com',
        },
      });
      this.socialLoginInitialized = true;
    } catch (err) {
      console.error('SocialLogin init error:', err);
    }
  }

  async signInWithGoogle(): Promise<void> {
    if (this.platform.isNative()) {
      await this.nativeGoogleSignIn();
    } else {
      await this.webGoogleSignIn();
    }
  }

  /** Native path: uses Capacitor Social Login plugin */
  private async nativeGoogleSignIn(): Promise<void> {
    const { SocialLogin } = await import('@capgo/capacitor-social-login');

    if (!this.socialLoginInitialized) {
      await SocialLogin.initialize({
        google: {
          webClientId: '728695329604-70417p57psoofhqlsio6qjv705a0ieqf.apps.googleusercontent.com',
        },
      });
      this.socialLoginInitialized = true;
    }

    const result = await SocialLogin.login({
      provider: 'google',
      options: {
        scopes: [
          'email',
          'profile',
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/drive',
        ],
      },
    });

    const idToken = (result as any).result?.idToken;
    const accessToken = (result as any).result?.accessToken;

    if (idToken) {
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      const firebaseResult = await signInWithCredential(auth, credential);
      await this.saveUserData(firebaseResult.user);
    }

    if (accessToken) {
      this.googleToken$.next(accessToken);
    }
  }

  /** Web path: existing popup flow */
  private async webGoogleSignIn(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar');
    provider.addScope('https://www.googleapis.com/auth/drive');

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result) as OAuthCredential | null;
    if (credential?.accessToken) {
      this.googleToken$.next(credential.accessToken);
    }
    await this.saveUserData(result.user);
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

  async signOutUser(): Promise<void> {
    if (this.platform.isNative()) {
      try {
        const { SocialLogin } = await import('@capgo/capacitor-social-login');
        await SocialLogin.logout({ provider: 'google' });
      } catch {}
    }
    await signOut(auth);
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
