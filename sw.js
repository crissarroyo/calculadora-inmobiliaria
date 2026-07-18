const CACHE='casaviva-v2';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 const isHTML = e.request.mode==='navigate' || (e.request.headers.get('accept')||'').includes('text/html');
 if(isHTML){
   // Network-first para el HTML: siempre intenta traer la versión más reciente
   e.respondWith(fetch(e.request).then(res=>{
     const cl=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,cl)); return res;
   }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
   return;
 }
 // Cache-first para el resto (iconos, librerías)
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
   const cl=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,cl)); return res;
 }).catch(()=>caches.match('./index.html'))));
});
