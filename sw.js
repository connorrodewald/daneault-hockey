// Puck Tracker service worker: web push only (no caching).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: 'Puck Tracker', body: e.data && e.data.text() }; }
  e.waitUntil(clients.matchAll({ type: 'window' }).then(ws => ws.forEach(w => w.postMessage({ push: d }))).then(() => self.registration.showNotification(d.title || 'Puck Tracker', {
    body: d.body || '', tag: d.tag, renotify: !!d.tag, icon: 'icon-192.png', badge: 'icon-192.png', data: { url: d.url || './' }
  })));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) if ('focus' in w) { if (/#(box|latest)/.test(url) && 'navigate' in w) return w.navigate(url).then(x => (x || w).focus()); return w.focus(); }
    return clients.openWindow(url);
  }));
});
