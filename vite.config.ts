import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// Production origin for canonical and link-preview addresses: the same SITE_URL that scripts/generate-sitemap.mjs reads.
const siteUrl = (process.env.SITE_URL || 'https://www.mgims.ac.in').replace(/\/+$/, '')

// Source maps are written for error monitoring (`sourcemap: 'hidden'`, so pages do not point to them) but must not be
// published: after each build they are moved from the output folder to sourcemaps/<folder>/, which is not deployed.
const keepSourceMapsPrivate = (): Plugin => {
  let outDir = ''
  return {
    name: 'keep-source-maps-private',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const target = path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'sourcemaps', path.basename(outDir))
      const move = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const from = path.join(dir, entry.name)
          if (entry.isDirectory()) move(from)
          else if (entry.name.endsWith('.map')) {
            const to = path.join(target, path.relative(outDir, from))
            fs.mkdirSync(path.dirname(to), { recursive: true })
            fs.renameSync(from, to)
          }
        }
      }
      if (fs.existsSync(outDir)) move(outDir)
    },
  }
}

// Public website. The admin console is a separate app: see vite.admin.config.ts.
// https://vite.dev/config/
export default defineConfig({
  define: { __SITE_URL__: JSON.stringify(siteUrl) },
  // Fixed ports so the public site (5173) and the admin console (5174) never take each other's port.
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  // Source maps for error monitoring, without linking them from the public bundle.
  build: { sourcemap: 'hidden' },
  // Same alias as tsconfig.app.json "paths".
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [
    react(),
    tailwindcss(),
    keepSourceMapsPrivate(),
    // The same origin in index.html (link-preview image and the organisation's structured data). It runs first, so Vite
    // sees an absolute og:image address and does not rewrite it as a local asset.
    { name: 'site-url-in-html', transformIndexHtml: { order: 'pre', handler: (html: string) => html.replaceAll('__SITE_URL__', siteUrl) } },
  ],
})
