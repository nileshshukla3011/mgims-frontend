import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// Unit tests (npm test): pure logic in src/, next to the code as *.test.ts. Browser tests live in e2e/ (Playwright).
export default mergeConfig(viteConfig, defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
}))
