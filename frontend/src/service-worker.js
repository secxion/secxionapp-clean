/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Precache assets injected by the build process
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache CSS, JS, and Web Worker requests
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'worker',
  new StaleWhileRevalidate(),
);

// Optionally, cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate(),
);
