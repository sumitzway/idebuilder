import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './drxIndex.css'
import App from './drxApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
