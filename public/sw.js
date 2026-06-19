// sw.js — Adam Loyalty Service Worker
// Handles: background push notifications, offline caching, PWA installability

const CACHE_NAME = "adam-v2";
const OFFLINE_URLS = ["/client/dashboard", "/"];

// ── Install: cache essential pages ───────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch(() => {
        // Don't fail install if caching fails
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH HANDLER — REQUIRED for Android Chrome installability ─────────
// Without this, beforeinstallprompt never fires on Android.
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip chrome-extension and non-http requests
  if (!event.request.url.startsWith("http")) return;

  // Skip API calls — always fetch fresh from network
  if (event.request.url.includes("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For everything else: network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed → try cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, return the dashboard
          if (event.request.mode === "navigate") {
            return caches.match("/client/dashboard");
          }
        });
      })
  );
});

// ── Push event: fires when server sends a push ────────────────────────
self.addEventListener("push", (event) => {
  let data = {
    title: "Adam Fidélité",
    body: "Vous avez reçu des points !",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
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
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/icon-192x192.png",
    tag: data.tag || "adam-points",
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || {},
    actions: [
      { action: "open", title: "Voir mon solde" },
      { action: "dismiss", title: "Fermer" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ── Notification click: open the app ─────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const urlToOpen = event.notification.data?.url || "/client/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.includes("/client/dashboard") && "focus" in client) {
            return client.focus();
          }
        }
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
      icon: icon || "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      tag: tag || "adam-local",
      vibrate: [150, 80, 150],
    });
  }
});