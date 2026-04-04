import { Injectable } from '@angular/core';
import { auth, db } from '../firebase';
import { ref, set, onValue, off } from 'firebase/database';
import { PlatformService } from './platform.service';
import { registerPlugin } from '@capacitor/core';
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

export interface UserLocation {
  lat: number;
  lng: number;
  timestamp: number;
  displayName: string;
  photoURL: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  // Web tracking state
  private watchId: number | null = null;
  private visibilityHandler: (() => void) | null = null;
  // Native tracking state
  private nativeWatchId: string | null = null;

  constructor(private platform: PlatformService) {}

  async startTracking(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    if (this.platform.isNative()) {
      await this.startNativeTracking();
    } else {
      this.startWebTracking();
    }
  }

  private async startNativeTracking(): Promise<void> {
    this.nativeWatchId = await BackgroundGeolocation.addWatcher(
      {
        backgroundMessage: 'FamilyApp partage votre position avec la famille.',
        backgroundTitle: 'Partage de position actif',
        requestPermissions: true,
        stale: false,
        distanceFilter: 50,
      },
      (position, error) => {
        if (error) {
          console.error('Background geolocation error:', error);
          return;
        }
        if (position) {
          this.savePosition(position.latitude, position.longitude);
        }
      }
    );
  }

  private startWebTracking(): void {
    if (!navigator.geolocation) return;

    this.sendPositionOnce();

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.savePosition(position.coords.latitude, position.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );

    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.sendPositionOnce();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private sendPositionOnce(): void {
    navigator.geolocation.getCurrentPosition(
      (position) => this.savePosition(position.coords.latitude, position.coords.longitude),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private savePosition(lat: number, lng: number): void {
    const user = auth.currentUser;
    if (!user) return;
    const locRef = ref(db, `/locations/${user.uid}`);
    set(locRef, {
      lat,
      lng,
      timestamp: Date.now(),
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
    });
  }

  async stopTracking(): Promise<void> {
    if (this.platform.isNative()) {
      if (this.nativeWatchId !== null) {
        await BackgroundGeolocation.removeWatcher({ id: this.nativeWatchId });
        this.nativeWatchId = null;
      }
    } else {
      if (this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
      if (this.visibilityHandler) {
        document.removeEventListener('visibilitychange', this.visibilityHandler);
        this.visibilityHandler = null;
      }
    }
  }

  listenAllLocations(callback: (locations: Record<string, UserLocation>) => void): () => void {
    const locRef = ref(db, '/locations');
    onValue(locRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
    return () => off(locRef);
  }
}
