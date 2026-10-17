import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/fonts'
import '@/styles/index.css'
import { BrowserRouter } from 'react-router-dom'
import { AdminPage } from '@/admin/AdminPage'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppErrorFallback } from '@/components/ErrorFallbacks'
import { startMonitoring } from '@/utils/monitoring'

startMonitoring()

// Entry of the admin console app (vite.admin.config.ts). It shares components, services and styles with the public
// site in src/, but is served and built separately so no admin code ships with the public website.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main id="main-content">
      <ErrorBoundary name="admin" fallback={AppErrorFallback}>
        {/* Each console section has its own address (src/admin/sections.ts). */}
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AdminPage />
        </BrowserRouter>
      </ErrorBoundary>
    </main>
  </StrictMode>,
)
