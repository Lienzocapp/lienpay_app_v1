/*
 * LienPay service worker — makes the PWA launch offline and feel app-like.
 *
 * Strategy is split by request type, because using one strategy for everything
 * is what makes a deployed update invisible:
 *
 *  - NAVIGATIONS (the HTML document): NETWORK-FIRST. The document names the
 *    hashed JS/CSS bundles for that build, so serving a cached document pins the
 *    app to an old build forever — a new deploy would never be picked up. We go
 *    to the network first and only fall back to the cache when offline.
 *
 *  - EVERYTHING ELSE (hashed bundles, fonts, images): cache-first with a
 *    background refresh (stale-while-revalidate). These URLs are
 *    content-addressed or static, so serving them from cache is safe and fast.
 *
 * Bump CACHE_NAME whenever the caching behaviour changes; the activate handler
 * deletes every other cache, which also evicts any stale document cached by a
 * previous version of this worker.
 */
const CACHE_NAME = "lienpay-v2";

/** The app shell used as the offline fallback for navigations. */
const OFFLINE_DOCUMENT = "index.html";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/** True when the request is for an HTML document (a page load/navigation). */
function isNavigation(request) {
  return (
    request.mode === "navigate" ||
    request.destination === "document" ||
    (request.headers.get("accept") || "").includes("text/html")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // --- Navigations: network-first so a new deploy is picked up immediately ---
  if (isNavigation(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          // Offline: serve the last good document, then the shell.
          return (
            (await cache.match(request)) ||
            (await cache.match(OFFLINE_DOCUMENT)) ||
            Response.error()
          );
        }
      })()
    );
    return;
  }

  // --- Static assets: cache-first with a background refresh ---
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })()
  );
});
