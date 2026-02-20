// ═══════════════════════════════════════════════════════════
// App.tsx — Root. Auth gate. Renders shell or login page.
// ═══════════════════════════════════════════════════════════

import { useStore } from './store'
import { AppShell } from './components'
import { AppRouter, LoginPage } from './dashboards'
import './styles.css'

export default function App() {
  const user = useStore(s => s.user)

  // Not authenticated — show login
  if (!user) return <LoginPage />

  // Authenticated — show app
  return (
    <AppShell>
      <AppRouter />
    </AppShell>
  )
}
