import { defineConfig, loadEnv, mergeConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import publicConfig from './vite.config.ts'

const fromHere = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// A demo password is built into the console bundle, so a build that has one must never be deployed publicly.
const warnAboutDemoPassword = (mode: string) => {
  const env = loadEnv(mode, fromHere('.'), 'VITE_')
  if (env.VITE_ADMIN_DEMO_PASSWORD) {
    console.warn('\n⚠  VITE_ADMIN_DEMO_PASSWORD is set: this console build opens with a demo password. Do not deploy it publicly.\n')
  }
}

// Admin console: a separate app (admin/index.html) on its own port, built into dist-admin/ so it can be deployed on
// its own host, ideally reachable only from the institute's network. It shares src/ with the public site.
export default defineConfig(({ command, mode }) => {
  if (command === 'build') warnAboutDemoPassword(mode)
  return mergeConfig(publicConfig, defineConfig({
    root: fromHere('./admin'),
    // These default to folders inside the root; keep one .env for both apps, a separate dependency cache (so both
    // dev servers can run at once) and the build output next to dist/.
    envDir: fromHere('.'),
    cacheDir: fromHere('./node_modules/.vite-admin'),
    server: { port: 5174, strictPort: true },
    preview: { port: 4174, strictPort: true },
    build: { outDir: fromHere('./dist-admin'), emptyOutDir: true },
  }))
})
