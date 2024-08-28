const CacheKey = 'cache_v1'

const initCache = () => {
    return caches.open(CacheKey).then((cache) => {
        return cache.addAll([
            "../../index.html",
            "../html/about.html",
            "../html/game.html",
            "../html/new_game.html"
        ]);
    }, (error) => {
        console.log(error);
    });
};

const tryNetwork = (req, timeout) => {
    console.log(req)
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(reject, timeout);
        fetch(req).then((res) => {
            clearTimeout(timeoutId);
            const responseClone = res.clone();
            caches.open(CacheKey).then((cache) => {
                cache.put(req, responseClone)
            })
            resolve(res);
        }, reject);
    });
};

const getFromCache = (req) => {
    console.log('network is off so getting from cache..')
    return caches.open(CacheKey).then((cache) => {
        return cache.match(req).then((result) => {
            return result || Promise.reject('no-match');
        });
    });
};

self.addEventListener('install', (e) => {
    console.log('installed');
    e.waitUntil(initCache());
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CacheKey) {
                    return caches.delete(key);
                }
            })
        )})
    );
});

self.addEventListener('fetch', (e) => {
    console.log("try network and store result or get data from cache")
    e.respondWith(tryNetwork(e.request, 400).catche(() => getFromCache(e.request)));
});