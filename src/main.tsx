import React, { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { StoreProvider } from './app/context/Store.tsx'
import { PrivyRoot } from './privy.tsx'
import './eruda-init.ts'

const WalletBootstrap = lazy(() =>
  import('./app/context/WalletBootstrap.tsx').then((m) => ({ default: m.WalletBootstrap }))
)
const SystemBootstrap = lazy(() =>
  import('./app/context/SystemBootstrap.tsx').then((m) => ({ default: m.SystemBootstrap }))
)

if ((import.meta as any).env.MODE === 'production') {
  console.log = () => {}
}

createRoot(document.getElementById('root')!).render(
  <PrivyRoot>
    <BrowserRouter>
      <StoreProvider>
        <App />
        <Suspense fallback={null}>
          <WalletBootstrap />
          <SystemBootstrap />
        </Suspense>
      </StoreProvider>
    </BrowserRouter>
  </PrivyRoot>
)
