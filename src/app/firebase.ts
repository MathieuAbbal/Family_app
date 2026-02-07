import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyB4DkZu3SqYLJCrxFGS7DybGGKUBrlJqaI",
  authDomain: "familyapp-e83b7.firebaseapp.com",
  databaseURL: "https://familyapp-e83b7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "familyapp-e83b7",
  storageBucket: "familyapp-e83b7.appspot.com",
  messagingSenderId: "728695329604",
  appId: "1:728695329604:web:c0a1ef7ebf32de4bcd7d11"
};

const app = initializeApp(firebaseConfig);
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
