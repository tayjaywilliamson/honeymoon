// Honeymoon Day Guide service worker — app shell + map tiles offline
const SHELL="hm-shell-v9"; const TILES="hm-tiles-v1"; const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-180.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("hm-shell-")&&k!==SHELL).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{ const u=new URL(e.request.url);
  if(u.hostname==="tile.openstreetmap.org"){ e.respondWith(caches.open(TILES).then(async c=>{ const hit=await c.match(e.request); if(hit) return hit; try{ const r=await fetch(e.request); if(r.ok) c.put(e.request,r.clone()); return r; }catch(err){ return new Response("",{status:504}); } })); return; }
  if(u.origin===location.origin){ e.respondWith(fetch(e.request).then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(SHELL).then(c=>c.put(e.request,cp)); } return r; }).catch(()=>caches.match(e.request).then(h=>h||caches.match("./index.html")))); }
});
