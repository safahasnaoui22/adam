// sw.js — Adam Loyalty Service Worker
// Handles: background push notifications, offline caching

const CACHE_NAME = "adam-v1";

// ── Install & activate ────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Push event: fires when server sends a push ────────────────────────
self.addEventListener("push", (event) => {
  let data = {
    title: "Adam Fidélité",
    body: "Vous avez reçu des points !",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    tag: "adam-points",
    data: {},
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192x192.png",
    badge: data.badge || "/icon-72x72.png",
    tag: data.tag || "adam-points",
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || {},
    actions: [
      { action: "open", title: "Voir mon solde" },
      { action: "dismiss", title: "Fermer" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification click: open the app ─────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const urlToOpen = event.notification.data?.url || "/client/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing tab if open
      for (const client of clients) {
        if (client.url.includes("/client/dashboard") && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// ── Message from page: show local notification ────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { title, body, icon, tag } = event.data;
    self.registration.showNotification(title || "Adam Fidélité", {
      body: body || "",
      icon: icon || "/icon-192x192.png",
      badge: "/icon-72x72.png",
      tag: tag || "adam-local",
      vibrate: [150, 80, 150],
    });
  }
});