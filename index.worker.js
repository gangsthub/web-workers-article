importScripts('https://unpkg.com/comlink/dist/umd/comlink.js')

const sum = (x, y) => x + y

Comlink.expose(sum)
