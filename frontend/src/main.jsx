import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { store } from './store/store'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Debug: Log API URL
console.log('🔍 Debug Info:')
console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
console.log('Root element:', document.getElementById('root'))

// Check if root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('❌ Root element not found!')
  document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>Error: Root element not found!</h1><p>Please check index.html</p></div>'
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>,
  )
}








