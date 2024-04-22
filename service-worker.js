importScripts('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js');
const CACHE_NAME = 'habitos-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/crear-habito.html',
  '/css/styles.css',
  '/js/main.js',
  '/img/icon-192x192.png',
  '/img/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
      caches.open(CACHE_NAME)
          .then((cache) => {
              console.log('Cache abierto');
              return cache.addAll(urlsToCache);
          })
          .then(() => {
              programarNotificaciones();
          })
  );
});


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});


function mostrarNotificacion(titulo, cuerpo) {
  const options = {
      body: cuerpo,
      icon: '/img/icon-192x192.png',
      vibrate: [200, 100, 200],
      data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
      },
      actions: [
          { action: 'ver', title: 'Ver hábitos' }
      ]
  };

  self.registration.showNotification(titulo, options);
}

function programarNotificaciones() {
  const habits = JSON.parse(localStorage.getItem('habits')) || [];

  habits.forEach((habit) => {
      const timeParts = habit.time.split(':');
      const hora = parseInt(timeParts[0], 10);
      const minutos = parseInt(timeParts[1], 10);

      const hoy = moment();
      const fechaProgramada = moment().set({ 'hour': hora, 'minute': minutos, 'second': 0, 'millisecond': 0 });

      if (fechaProgramada.isBefore(hoy)) {
          fechaProgramada.add(1, 'days');
      }

      const tiempoHastaNotificacion = fechaProgramada.diff(hoy);

      setTimeout(() => {
          mostrarNotificacion('Es hora de practicar tu hábito', habit.name);
      }, tiempoHastaNotificacion);
  });
}


