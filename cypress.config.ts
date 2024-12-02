import { defineConfig } from 'cypress'
import coverageTask from '@cypress/code-coverage/task'
import vitePreprocessor from 'cypress-vite'

export default defineConfig({
  e2e: {
    baseUrl: 'http://0.0.0.0:3000',
    specPattern: 'cypress/e2e/**/*.ts',
    setupNodeEvents(on, config) {
      coverageTask(on, config)
      on('file:preprocessor', vitePreprocessor())
      config.env = {
        ...process.env,
        ...config.env
      }
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
