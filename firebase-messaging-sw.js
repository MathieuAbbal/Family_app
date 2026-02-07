/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyB4DkZu3SqYLJCrxFGS7DybGGKUBrlJqaI',
  authDomain: 'familyapp-e83b7.firebaseapp.com',
  projectId: 'familyapp-e83b7',
  storageBucket: 'familyapp-e83b7.appspot.com',
  messagingSenderId: '728695329604',
  appId: '1:728695329604:web:c0a1ef7ebf32de4bcd7d11'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || 'FamilyApp';
  const options = {
    body: data.body || 'Nouveau message',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    data: { url: data.url || '/' }
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
