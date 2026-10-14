const CACHE='dead-earth-pixel-v3-20261014';
const CORE=['./','./index.html','./styles.css','./fast-map.css','./fast-map.js','./app.js','./pixel-ui.js','./manifest.webmanifest','./icon.svg',
'./assets/survivor.png','./assets/portrait.png','./assets/floor.jpg','./assets/ruins-backdrop.jpg',
...['bandage','ammo','food','parts','wood','cloth','water','metal','medkit'].map(id=>'./assets/item-'+id+'.png')];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('dead-earth-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}return response;}).catch(()=>caches.match(event.request)));
});
