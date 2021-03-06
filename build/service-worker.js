importScripts("/precache-manifest.e21b1a865c8880568a24d81326494444.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");


workbox.routing.registerRoute(
  new RegExp('https:.*min\.(css|js)'),
  workbox.strategies.staleWhileRevalidate({
  cacheName: 'cdn-cache'
  })
)

workbox.routing.registerRoute(
  new RegExp('https://todoserverpwafirstofmine.herokuapp.com/'),
  workbox.strategies.networkFirst()
)

// Below code is only for example

// self.addEventListener('install', event => {
//   console.log("install")
// })

// self.addEventListener('activate', event => {
//   console.log('activate')
// })


self.addEventListener('fetch', event => {
  if(event.request.method === "POST" || event.request.method === "DELETE") {
    event.respondWith(
      fetch(event.request).catch(err => {
        return new Response(
          JSON.stringify({error: "This action is disabled while app is offline"}), {
            headers: { 'Content-Type': 'application/json'}
          }
        )
      })
    )
  }
})

self.addEventListener('push', event => {
  event.waitUntil(self.registration.showNotification('Todo List',{
    icon:'/256*256.png',
    body: event.data.text()
  }))
})

workbox.precaching.precacheAndRoute(self.__precacheManifest)




