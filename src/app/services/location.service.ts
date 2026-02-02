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

  startTracking(): void {
    if (!navigator.geolocation) return;
    const user = auth.currentUser;
    if (!user) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locRef = ref(db, `/locations/${user.uid}`);
        set(locRef, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
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
