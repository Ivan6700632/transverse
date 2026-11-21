// InkWave — service worker
// Потрібен, щоб браузер дозволив встановлення сайту як додатку.
// Свідомо НІЧОГО не кешує (ні script.js, ні запити до Supabase),
// тож після оновлень сайту ніхто не сидить зі старою версією.
// Єдине, що робить: показує просту сторінку, якщо немає інтернету.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
    if (event.request.mode !== 'navigate') return; // решту запитів браузер виконує сам
    event.respondWith(
        fetch(event.request).catch(() => new Response(
            '<!DOCTYPE html><html lang="uk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
            '<title>InkWave — немає зв\'язку</title></head>' +
            '<body style="font-family:Segoe UI,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f4f6f9;color:#1e293b;text-align:center">' +
            '<div><h1>📚 InkWave</h1><p>Немає підключення до інтернету.<br>Перевірте з\'єднання та оновіть сторінку.</p></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        ))
    );
});
