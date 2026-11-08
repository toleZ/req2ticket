import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import { App } from './App.jsx'
import { queryClient } from '@/lib/queries/queryClient'

/* The prefers-reduced-motion block in index.css only caps CSS transitions; motion
   animates through the Web Animations API and ignores it entirely. This covers the
   whole app in one place — do not remove it.

   QueryClientProvider makes the data cache (lib/queries) available to every page. The
   devtools panel only exists in development: the production build leaves it out. */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MotionConfig>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
    </QueryClientProvider>
  </StrictMode>,
)
