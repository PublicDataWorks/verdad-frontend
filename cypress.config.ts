import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://0.0.0.0:3000',
    specPattern: 'cypress/e2e/**/*.ts'
  },
  fileServerFolder: 'dist',
  viewportWidth: 1280,
  viewportHeight: 800,
  video: true,
  videoCompression: true,
  chromeWebSecurity: false,
  includeShadowDom: true
})
