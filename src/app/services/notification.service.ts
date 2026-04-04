import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getToken, onMessage } from 'firebase/messaging';
import { ref, set, remove } from 'firebase/database';
import { db, auth, getMessagingInstance } from '../firebase';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private initialized = false;

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private platform: PlatformService
  ) {}

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    if (this.platform.isNative()) {
      await this.initNativePush();
    } else {
      await this.initWebPush();
    }
  }

  private async initNativePush(): Promise<void> {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== 'granted') return;

      await PushNotifications.register();

      PushNotifications.addListener('registration', async (token) => {
        await this.saveToken(token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      // Foreground notification
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        const title = notification.title || 'FamilyApp';
        const body = notification.body || '';
        this.playNotificationSound();
        const snack = this.snackBar.open(`${title}: ${body}`, 'Voir', { duration: 5000 });
        const url = (notification.data as any)?.url;
        if (url) {
          snack.onAction().subscribe(() => this.router.navigateByUrl(url));
        }
      });

      // Notification tapped (app was in background)
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        const url = (action.notification.data as any)?.url;
        if (url) this.router.navigateByUrl(url);
      });
    } catch (err) {
      console.error('Native push init failed:', err);
    }
  }

  private async initWebPush(): Promise<void> {
    const messaging = await getMessagingInstance();
    if (!messaging) return;

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
      console.error('Web notification init failed:', err);
    }

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

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1108, ctx.currentTime + 0.15);

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
    if (this.platform.isNative()) {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        await PushNotifications.removeAllListeners();
      } catch {}
    }
  }
}
