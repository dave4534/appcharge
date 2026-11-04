import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './design-system/styles/generated/tokens.css'
import './design-system/styles/generated/typography.css'
import './design-system/styles/themes/appcharge.css'
import './tailwind.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
