import * as Comlink from 'https://unpkg.com/comlink/dist/esm/comlink.mjs'

const worker = new Worker('index.worker.js')
const workerSum = Comlink.wrap(worker) // exposing `sum`

workerSum(1, 3).then(console.log)
