import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8084',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/integration/**/*.spec.ts',
    experimentalMemoryManagement: true,
    retries: 0,
    defaultCommandTimeout: 30000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
