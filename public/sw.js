// sw.js — Adam Loyalty Service Worker v5
// Fixed: removed /client/dashboard from precache (caused install deadlock)
// Fixed: skip navigation requests in fetch handler (caused "still adding previous site")
// Fixed: bumped cache name to force clean replacement of broken v4

const CACHE_NAME = "adam-v5";

// ── Install ───────────────────────────────────────────────────────────
// CRITICAL: Do NOT put authenticated routes like /client/dashboard here.
// Chrome fetches start_url during install validation. If that URL redirects
// (because localStorage is empty in install context), cache.addAll() throws
// and the entire install hangs forever → "still adding previous site" bug.
// Only cache static assets that always return 200 with no auth required.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        "/icons/icon-192x192.png",
        "/icons/icon-512x512.png",
        "/icons/icon-72x72.png",
      ]).catch((err) => {
        // Non-fatal: icons may not exist yet during first deploy
        console.warn("[SW install] precache partial failure:", err);
      })
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

  // CRITICAL FIX: Never intercept navigation requests (HTML page loads).
  // Chrome uses a navigation fetch to validate start_url during PWA install.
  // If we intercept it and return a cached redirect or stale shell, Chrome
  // sees a non-200 and marks the install as permanently failed.
  // Next.js handles routing client-side anyway — we don't need to cache HTML.
  if (request.mode === "navigate") return;

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
        data: { url: payload.url, ...payload.data },
        actions: [
          { action: "open", title: "Voir mon solde" },
          { action: "dismiss", title: "Fermer" },
        ],
      })
      .catch((err) => {
        console.error("[SW push] showNotification failed:", err);
      })
  );
});

// ── Notification click ────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/client/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          if (
            clientUrl.pathname.includes("/client/dashboard") &&
            "focus" in client
          ) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ── Notification close ────────────────────────────────────────────────
self.addEventListener("notificationclose", (_event) => {
  // Optional: analytics
});

// ── Message from page: show local notification ────────────────────────
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, icon, tag } = event.data;

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

// ── Background Sync ────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "retry-claim") {
    event.waitUntil(retrySyncQueue());
  }
});

async function retrySyncQueue() {
  // Implement if you store failed API calls in IndexedDB for retry
}