// public/sw.js

self.addEventListener("install", (event) => {
  console.log("Service worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated");

  event.waitUntil(
    clients.claim()
  );
});

// Normal requests
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

// Receive push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",      // your PWA icon
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
      requireInteraction: true,
      data: {
        url: data.url || "/",
      },
    })
  );
});

// When user clicks notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {

      // Focus existing tab if already open
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }

      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(
          event.notification.data.url || "/"
        );
      }
    })
  );
});