const CACHE_NAME = 'biblia-cq-v1';
const FILES_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './tradutor.js',
    './dados.js',
    './icone.svg',
    './biblia_cq_backup.json'
];

// Instala o motor e guarda os arquivos no cache do celular
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// Quando o app pedir um arquivo, entrega o que está salvo (Offline First)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});