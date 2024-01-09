import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'https://0.0.0.0:3030',
    specPattern: 'cypress/e2e/**/*.ts'
  },
  fileServerFolder: 'dist',
  fixturesFolder: false,
  projectId: 'etow1b',
  viewportWidth: 1280,
  viewportHeight: 800,
  video: true,
  videoCompression: true,
  chromeWebSecurity: false,
  includeShadowDom: true
})
