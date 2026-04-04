import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';
import { environment } from '../environments/environment';

const app = initializeApp(environment.firebase);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

let _messaging: Messaging | null = null;
export async function getMessagingInstance(): Promise<Messaging | null> {
  if (_messaging) return _messaging;
  const supported = await isSupported();
  if (supported) {
    _messaging = getMessaging(app);
  }
  return _messaging;
}
