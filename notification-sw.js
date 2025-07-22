// Service Worker for handling notifications
self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
    if (event.data.type === 'UPDATE_NOTIFICATION') {
        event.waitUntil(
            self.registration.showNotification(
                event.data.title,
                event.data.options
            )
        );
    }
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    const action = event.action;
    const songIndex = event.notification.data?.songIndex;
    
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then(windowClients => {
        if (action === 'prev') {
            // Handle previous track
            return Promise.all(windowClients.map(client => {
                return client.postMessage({ action: 'PREV_TRACK' });
            }));
        } else if (action === 'next') {
            // Handle next track
            return Promise.all(windowClients.map(client => {
                return client.postMessage({ action: 'NEXT_TRACK' });
            }));
        } else {
            // Focus the app
            if (windowClients.length > 0) {
                return windowClients[0].focus();
            }
            return clients.openWindow('/');
        }
    });
    
    event.waitUntil(promiseChain);
});
