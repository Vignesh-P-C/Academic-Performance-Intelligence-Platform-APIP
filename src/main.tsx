// ═══════════════════════════════════════════════════════════
// main.tsx — React 18 entry. Single root. No config needed.
// ═══════════════════════════════════════════════════════════

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
