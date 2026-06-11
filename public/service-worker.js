const CACHE_NAME = "asn-v3-cache"; // ← era v2

// Estos archivos son tu "App Shell" (el cascarón)
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  "/robots.txt"
];

// 1. INSTALACIÓN: "Llenando la bodega"
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Guardando App Shell en caché");
      // Si uno falla, falla todo, por eso usamos archivos seguros
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ACTIVACIÓN: "Limpieza de versiones"
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Borrando caché antigua");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. FETCH: "El Guardia de Tráfico" (Aquí está la mejora)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // JS y CSS siempre frescos de la red — nunca de caché
  if (url.pathname.includes("/static/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});