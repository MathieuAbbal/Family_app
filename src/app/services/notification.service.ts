import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getToken, onMessage } from 'firebase/messaging';
import { ref, set, remove } from 'firebase/database';
import { db, auth, getMessagingInstance } from '../firebase';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private initialized = false;

  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    const messaging = await getMessagingInstance();
    if (!messaging) return;

    // Request permission & get token
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      const token = await getToken(messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: swRegistration
      });

      if (token) {
        await this.saveToken(token);
      }
    } catch (err) {
      console.error('Notification init failed:', err);
    }

    // Foreground messages → snackbar + son
    onMessage(messaging, (payload) => {
      const data = payload.data || {};
      const title = data['title'] || 'FamilyApp';
      const body = data['body'] || '';

      this.playNotificationSound();

      const snack = this.snackBar.open(`${title}: ${body}`, 'Voir', { duration: 5000 });
      snack.onAction().subscribe(() => {
        const url = data['url'];
        if (url) this.router.navigateByUrl(url);
      });
    });
  }

  private playNotificationSound(): void {
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      // Double ding
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);       // La5
      oscillator.frequency.setValueAtTime(1108, ctx.currentTime + 0.15); // Do#6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  private async saveToken(token: string): Promise<void> {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await set(ref(db, `/users/${uid}/fcmToken`), token);
  }

  async removeToken(): Promise<void> {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await remove(ref(db, `/users/${uid}/fcmToken`));
    this.initialized = false;
  }
}
