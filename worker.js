/* global self, caches, fetch */
'use strict'

var cachename = 'shopping-list-vuejs-pouchdb-0.0.1'
var urlstocache = [
  'index.html',
  'shoppinglist.js',
  'shoppinglist.css',
  'https://cdnjs.cloudflare.com/ajax/libs/cuid/1.3.8/browser-cuid.min.js',
  'https://cdn.jsdelivr.net/gh/pouchdb/pouchdb@6.3.4/dist/pouchdb.min.js',
  'https://cdn.jsdelivr.net/gh/pouchdb/pouchdb@6.3.4/dist/pouchdb.find.min.js',
  'https://unpkg.com/vue-material@0.7.4/dist/vue-material.js',
  'https://unpkg.com/vue@2.4.2/dist/vue.js',
  'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://unpkg.com/vue-material@0.7.4/dist/vue-material.css',
  'https://fonts.gstatic.com/s/roboto/v16/oMMgfZMQthOryQo9n22dcuvvDin1pK8aKteLpeZ5c0A.woff2',
  'https://fonts.gstatic.com/s/roboto/v16/RxZJdnzeo3R5zSexge8UUZBw1xU1rKptJj_0jans920.woff2',
  'https://fonts.gstatic.com/s/materialicons/v29/2fcrYFNaTjcS6g4U3t-Y5UEw0lE80llgEseQY3FEmqw.woff2'
];

// install/cache page assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(cachename)
      .then(function (cache) {
        console.log('cache opened')
        return cache.addAll(urlstocache)
      })
  )
})

// intercept page requests
self.addEventListener('fetch', function (event) {
  console.log(event.request.url)
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // serve requests from cache (if found)
      return response || fetch(event.request)
    })
  )
})

// service worker activated, remove outdated cache
self.addEventListener('activate', function (event) {
  console.log('worker activated')
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          // filter old versioned keys
          return key !== cachename
        }).map(function (key) {
          return caches.delete(key)
        })
      )
    })
  )
})
