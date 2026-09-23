const CACHE='sao-jose-v1168';
const SHELL=['./index.html','./styles.css?v=268','./app.js?v=268','./manifest.webmanifest?v=268'];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  const isDocument=event.request.mode==='navigate'||event.request.destination==='document';
  const isCode=['script','style','manifest'].includes(event.request.destination) ||
    /\.(?:js|css|webmanifest)$/.test(url.pathname);
  if(isDocument||isCode){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(response=>{
          if(response&&response.ok){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put(event.request,copy));
          }
          return response;
        })
        .catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
      if(response&&response.ok){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      }
      return response;
    }))
  );
});
self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING') self.skipWaiting();
  if(event.data&&event.data.type==='CLEAR_OLD_CACHES'){
    event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));
  }
});