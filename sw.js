self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    const action = event.action;
    const songData = event.notification.data;
    
    if (action === 'prev') {
        event.waitUntil(
            clients.matchAll({type: 'window'}).then(windowClients => {
                windowClients.forEach(client => {
                    client.postMessage({action: 'prev'});
                });
            })
        );
    } else if (action === 'next') {
        event.waitUntil(
            clients.matchAll({type: 'window'}).then(windowClients => {
                windowClients.forEach(client => {
                    client.postMessage({action: 'next'});
                });
            })
        );
    } else {
        event.waitUntil(
            clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(windowClients => {
                if (windowClients.length > 0) {
                    return windowClients[0].focus();
                }
                return clients.openWindow('/');
            })
        );
    }
});

self.addEventListener('message', event => {
    if (event.data.type === 'showNotification') {
        const { title, options } = event.data;
        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});
