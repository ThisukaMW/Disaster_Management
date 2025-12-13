import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupOfflineHandler } from './utils/offlineHandler'

// Setup offline handler to prevent Safari "can't connect" error
setupOfflineHandler()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
