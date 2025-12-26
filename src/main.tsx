import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Suppress harmless XRSession cleanup errors from React Three XR
if (typeof window !== 'undefined') {
  const originalError = window.onerror
  const originalUnhandledRejection = window.onunhandledrejection
  
  window.onerror = (message, source, lineno, colno, error) => {
    const msg = String(message)
    if (msg.includes('XRSession') || msg.includes('Failed to execute \'end\' on \'XRSession\'')) {
      return true // Suppress error
    }
    return originalError ? originalError(message, source, lineno, colno, error) : false
  }
  
  window.onunhandledrejection = (event) => {
    const reason = event.reason
    const msg = reason?.message || String(reason) || ''
    if (msg.includes('XRSession') || msg.includes('Failed to execute') || msg.includes('InvalidStateError')) {
      event.preventDefault()
      return
    }
    if (originalUnhandledRejection) {
      originalUnhandledRejection.call(window, event)
    }
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)

