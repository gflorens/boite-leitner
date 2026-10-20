// Réseau d'abord (pour recevoir les mises à jour), cache en secours (hors connexion).
const CACHE = "leitner-v4";
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    try {
      const res = await fetch(req, { cache: "no-cache" });
      if (res && (res.ok || res.type === "opaque")) c.put(req, res.clone());
      return res;
    } catch {
      return (await c.match(req, { ignoreSearch: true })) || (req.mode === "navigate" ? c.match("index.html") : Response.error());
    }
  }));
});
