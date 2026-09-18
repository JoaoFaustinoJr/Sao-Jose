const CACHE='sao-jose-v43';
const ASSETS=['./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(r.mode==='navigate'||u.origin===location.origin){e.respondWith(fetch(r,{cache:'reload'}).catch(()=>caches.match(r)))}});