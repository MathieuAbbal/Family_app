import { Injectable } from '@angular/core';
import { auth, db } from '../firebase';
import { ref, set, onValue, off } from 'firebase/database';

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
  private watchId: number | null = null;
  private visibilityHandler: (() => void) | null = null;

  startTracking(): void {
    if (!navigator.geolocation) return;
    const user = auth.currentUser;
    if (!user) return;

    // Envoi immédiat de la position à l'ouverture
    this.sendPositionOnce();

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.savePosition(position);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );

    // Re-envoyer la position quand l'app revient au premier plan
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.sendPositionOnce();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private sendPositionOnce(): void {
    navigator.geolocation.getCurrentPosition(
      (position) => this.savePosition(position),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private savePosition(position: GeolocationPosition): void {
    const user = auth.currentUser;
    if (!user) return;
    const locRef = ref(db, `/locations/${user.uid}`);
    set(locRef, {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: Date.now(),
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
    });
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  listenAllLocations(callback: (locations: Record<string, UserLocation>) => void): () => void {
    const locRef = ref(db, '/locations');
    const handler = onValue(locRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
    return () => off(locRef);
  }
}
