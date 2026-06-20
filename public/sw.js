// sw.js — Adam Loyalty Service Worker v4
// Robust push notifications + background delivery

const CACHE_NAME = "adam-v4";
const OFFLINE_URL = "/offline";

// ── Install ───────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  // Pre-cache the offline fallback page if it exists
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/icons/icon-192x192.png", "/icons/icon-72x72.png"]).catch(() => {})
    )
  );
});

// ── Activate ──────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── FETCH — network-first, cache fallback ─────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests over http/https
  if (request.method !== "GET") return;
  if (!request.url.startsWith("http")) return;

  // Never intercept API calls — always go to network
  if (request.url.includes("/api/")) return;

  // Chrome DevTools: skip extension requests
  if (request.url.startsWith("chrome-extension://")) return;

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Only cache successful same-origin or CORS responses
        if (
          networkResponse &&
          networkResponse.ok &&
          (networkResponse.type === "basic" || networkResponse.type === "cors")
        ) {
          const clone = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, clone))
            .catch(() => {});
        }
        return networkResponse;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) =>
            cached ||
            new Response("Offline - content not available", {
              status: 503,
              statusText: "Service Unavailable",
              headers: { "Content-Type": "text/plain" },
            })
        )
      )
  );
});

// ── Push notifications ────────────────────────────────────────────────
// This fires when a push event arrives from the server (even when app is closed).
self.addEventListener("push", (event) => {
  let payload = {
    title: "Adam Fidélité",
    body: "Vous avez reçu des points !",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: "adam-points",
    url: "/client/dashboard",
    data: {},
  };

  if (event.data) {
    try {
      const incoming = event.data.json();
      payload = { ...payload, ...incoming };
    } catch {
      payload.body = event.data.text();
    }
  }

  // IMPORTANT: event.waitUntil keeps the SW alive until the notification is shown.
  // Without this, the SW may be killed before showNotification completes.
  event.waitUntil(
    self.registration
      .showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        tag: payload.tag,
        renotify: true,
        requireInteraction: false,
        vibrate: [200, 100, 200, 100, 200],
        // Store URL in notification data so we can open it on click
        data: { url: payload.url, ...payload.data },
        actions: [
          { action: "open", title: "Voir mon solde" },
          { action: "dismiss", title: "Fermer" },
        ],
      })
      .catch((err) => {
        // Log but don't let errors break the push handler
        console.error("[SW push] showNotification failed:", err);
      })
  );
});

// ── Notification click ────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  // Determine the URL to open
  const targetUrl =
    event.notification.data?.url ||
    "/client/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus an existing window that already has the dashboard open
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          if (
            clientUrl.pathname.includes("/client/dashboard") &&
            "focus" in client
          ) {
            return client.focus();
          }
        }
        // No matching window found — open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ── Notification close (user swiped away) ────────────────────────────
self.addEventListener("notificationclose", (_event) => {
  // Optional: send analytics ping here
});

// ── Message from page: show local notification ────────────────────────
// Called by showSWNotification() in the dashboard when the app IS open.
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, icon, tag } = event.data;

    // Only show if permission granted; the page already checks this,
    // but guard here too to avoid unhandled promise rejections.
    if (self.Notification && self.Notification.permission !== "granted") return;

    event.waitUntil(
      self.registration
        .showNotification(title || "Adam Fidélité", {
          body: body || "",
          icon: icon || "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          tag: tag || "adam-local",
          vibrate: [150, 80, 150],
          data: { url: "/client/dashboard" },
        })
        .catch((err) => console.warn("[SW message] showNotification failed:", err))
    );
  }
});

// ── Background Sync (optional: retry failed point claims) ────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "retry-claim") {
    event.waitUntil(retrySyncQueue());
  }
});

async function retrySyncQueue() {
  // Implement if you store failed API calls in IndexedDB for retry
}