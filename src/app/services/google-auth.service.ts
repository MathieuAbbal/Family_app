import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';

declare const gapi: any;
declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private gapiLoaded = false;
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private googleEmail: string | null = null;
  private signInResolve: ((value: boolean) => void) | null = null;
  /** Emits when connection status changes */
  connectionChanged = new Subject<boolean>();

  constructor(private authService: AuthService) {
    // Listen for Google token from Firebase sign-in (fresh login)
    this.authService.googleToken$.subscribe((token) => {
      this.setToken(token);
    });

    // When Firebase restores a session, request a Calendar token silently
    // Delay to let Firebase token (from googleToken$) be set first on fresh sign-in
    onAuthStateChanged(auth, (user) => {
      if (user && !this.accessToken) {
        setTimeout(() => {
          if (!this.accessToken) {
            this.requestTokenSilently();
          }
        }, 1500);
      }
    });
  }

  /** Request a Calendar token silently using GIS (no popup if already consented) */
  private async requestTokenSilently(): Promise<void> {
    try {
      await this.loadGapi();
      await this.initTokenClient();
      if (this.tokenClient) {
        this.tokenClient.requestAccessToken({ prompt: '' });
      }
    } catch {
      // GIS not available yet
    }
  }

  /** Set the access token (from Firebase Google auth or GIS) */
  setToken(token: string): void {
    this.accessToken = token;
    this.loadGapi().then(() => {
      gapi.client.setToken({ access_token: token });
    }).catch(() => {});
    this.fetchGoogleEmail();
    this.saveConnectionStatus(true);
    this.connectionChanged.next(true);
  }

  loadGapi(): Promise<void> {
    if (this.gapiLoaded) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const checkGapi = () => {
        if (typeof gapi === 'undefined') {
          setTimeout(checkGapi, 200);
          return;
        }
        gapi.load('client', async () => {
          try {
            await gapi.client.init({
              discoveryDocs: environment.googleCalendar.discoveryDocs,
            });
            this.gapiLoaded = true;
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      };
      checkGapi();
    });
  }

  initTokenClient(): Promise<void> {
    return new Promise((resolve) => {
      const checkGoogle = () => {
        if (typeof google === 'undefined' || !google.accounts?.oauth2) {
          setTimeout(checkGoogle, 200);
          return;
        }
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: environment.googleCalendar.clientId,
          scope: environment.googleCalendar.scopes,
          callback: (response: { error?: string; access_token?: string }) => {
            if (response.error) {
              if (this.signInResolve) {
                this.signInResolve(false);
                this.signInResolve = null;
              }
              return;
            }
            this.accessToken = response.access_token || null;
            if (this.accessToken) {
              gapi.client.setToken({ access_token: this.accessToken });
              this.fetchGoogleEmail();
            }
            this.saveConnectionStatus(!!this.accessToken);
            this.connectionChanged.next(!!this.accessToken);
            if (this.signInResolve) {
              this.signInResolve(!!this.accessToken);
              this.signInResolve = null;
            }
          },
        });
        resolve();
      };
      checkGoogle();
    });
  }

  signIn(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.tokenClient) {
        resolve(false);
        return;
      }
      this.signInResolve = resolve;
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  signOut(): void {
    if (this.accessToken) {
      try { google.accounts.oauth2.revoke(this.accessToken); } catch {}
      try { gapi.client.setToken(null); } catch {}
      this.accessToken = null;
      this.googleEmail = null;
      this.saveConnectionStatus(false);
      this.connectionChanged.next(false);
    }
  }

  isConnected(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getGoogleEmail(): string | null {
    return this.googleEmail;
  }

  private async fetchGoogleEmail(): Promise<void> {
    try {
      const resp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      const data = await resp.json();
      this.googleEmail = data.email || null;
    } catch {
      this.googleEmail = null;
    }
  }

  private saveConnectionStatus(connected: boolean): void {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    update(ref(db, `/users/${uid}`), {
      googleCalendar: {
        connected,
        calendarId: 'primary'
      }
    });
  }
}
