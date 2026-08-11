import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import { App } from './App.jsx'

/* The prefers-reduced-motion block in index.css only caps CSS transitions; motion
   animates through the Web Animations API and ignores it entirely. This covers the
   whole app in one place — do not remove it. */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
)
