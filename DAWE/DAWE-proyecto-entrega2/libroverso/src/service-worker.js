import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

// Precache all assets injected by Vite PWA
precacheAndRoute(self.__WB_MANIFEST)

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  })
)

// Cache Bootstrap and other CDN resources
registerRoute(
  ({ url }) => url.origin === 'https://cdn.jsdelivr.net',
  new StaleWhileRevalidate({
    cacheName: 'cdn-cache'
  })
)
