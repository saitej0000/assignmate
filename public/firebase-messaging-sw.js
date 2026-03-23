importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase
// TODO: YOU MUST FILL THESE VALUES FOR BACKGROUND NOTIFICATIONS TO WORK
firebase.initializeApp({
  apiKey: "AIzaSyAfGO0SkAJopglyoHpoHASuddExfdlCxtI", // (from .env VITE_FIREBASE_API_KEY)
  authDomain: "assignmate-cfe7e.firebaseapp.com",
  projectId: "assignmate-cfe7e",
  storageBucket: "assignmate-cfe7e.appspot.com",
  messagingSenderId: "52219651086", // (from .env VITE_FIREBASE_MESSAGING_SENDER_ID)
  appId: "1:52219651086:web:a6014135e38c3c2799c85f" // (from .env VITE_FIREBASE_APP_ID)
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/logo.png', // Dynamic icon support
    image: payload.notification.image, // Support large images
    badge: '/badge.png',
    data: { url: payload.data.url || payload.data.click_action || '/' } // Link to open when clicked
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if tab is already open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open new tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
