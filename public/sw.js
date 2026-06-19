// sw.js — Adam Loyalty Service Worker v3
// Fixed: "Failed to convert value to Response" error

const CACHE_NAME = "adam-v3";

// ── Install ───────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  // Skip waiting immediately — don't let old SW block new one
  self.skipWaiting();
});

// ── Activate ──────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// ── FETCH — fixed, no undefined Response bug ──────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests over http/https
  if (request.method !== "GET") return;
  if (!request.url.startsWith("http")) return;

  // Never intercept API calls — always go to network
  if (request.url.includes("/api/")) return;

  // For everything else: try network, fall back to cache
  // IMPORTANT: always return a valid Response, never undefined
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache a clone of successful responses
        if (networkResponse && networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Must return a valid Response — never undefined
          return new Response("Offline - content not available", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" },
          });
        });
      })
  );
});

// ── Push notifications ────────────────────────────────────────────────
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
    try { data = { ...data, ...event.data.json() }; }
    catch { data.body = event.data.text(); }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
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
    })
  );
});

// ── Notification click ────────────────────────────────────────────────
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
        if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
      })
  );
});

// ── Local notification from page ──────────────────────────────────────
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