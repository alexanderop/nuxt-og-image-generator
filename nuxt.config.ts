// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  nitro: { preset: 'static' },
  // app: { baseURL: '/og-studio/' }, // Usually needed for production build, might interfere with dev server paths
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  vite: {
    assetsInclude: ['**/*.wasm', '**/*.ttf'],
    define: {
      'process.browser': true,
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/ui'
  ],
  css: ['~/assets/css/main.css']
})