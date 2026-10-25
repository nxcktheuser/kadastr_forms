/* Кадастровые формы — service worker. Keeps the app usable offline. */
const VERSION="kf-a1e85ef16f";
const CORE=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","icons/apple-touch-icon.png"];
const CDN=["https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js","https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js","https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{const c=await caches.open(VERSION);await c.addAll(CORE);
  for(const u of CDN){try{const r=await fetch(u,{mode:"cors"});if(r.ok)await c.put(u,r)}catch(err){}}
  self.skipWaiting()})())});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==VERSION)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(req.mode==="navigate"){ // page: network first so updates arrive, cache when offline
    e.respondWith((async()=>{try{const r=await fetch(req);const c=await caches.open(VERSION);c.put("index.html",r.clone());return r}catch(err){return (await caches.match("index.html"))||(await caches.match("./"))}})());return}
  if(url.origin===location.origin||/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(url.host)){ // static files: cache first, refresh in background
    e.respondWith((async()=>{const hit=await caches.match(req);
      const net=fetch(req).then(async r=>{if(r&&(r.ok||r.type==="opaque")){const c=await caches.open(VERSION);c.put(req,r.clone())}return r}).catch(()=>null);
      return hit||(await net)||new Response("",{status:504})})())}
});
