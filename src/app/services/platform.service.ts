import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }

  isWeb(): boolean {
    return !Capacitor.isNativePlatform();
  }
}
