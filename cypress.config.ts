import { defineConfig } from 'cypress'
import coverageTask from '@cypress/code-coverage/task'

export default defineConfig({
  e2e: {
    baseUrl: 'http://0.0.0.0:3000',
    specPattern: 'cypress/e2e/**/*.ts',
    setupNodeEvents(on, config) {
      coverageTask(on, config)
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config
    }
  },
  fileServerFolder: 'dist',
  viewportWidth: 1280,
  viewportHeight: 800,
  video: true,
  videoCompression: true,
  chromeWebSecurity: false,
  includeShadowDom: true
})
