import { init as initSatori } from 'satori/wasm'
import initYoga              from 'yoga-wasm-web'
import { Resvg }             from '@resvg/resvg-wasm'
import resvgWasmURL          from '@resvg/resvg-wasm/index_bg.wasm?url'

let ready: Promise<void> | null = null

export default defineNuxtPlugin(() => {
  if (ready) return
  ready = (async () => {
    const [yogaWasm, resvgWasm] = await Promise.all([
      fetch('/yoga.wasm').then(r => r.arrayBuffer()),
      fetch(resvgWasmURL).then(r => r.arrayBuffer())
    ])

    const yoga = await initYoga(yogaWasm)
    initSatori(yoga)

    console.log('Satori, Yoga, and Resvg WASM loaded.')
  })()
}) 