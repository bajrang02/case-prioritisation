import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

window.onerror = function(msg, url, line, col, error) {
  document.body.innerHTML = `<div style="padding:20px;color:red;font-family:sans-serif">
    <h2>Global Error Caught</h2>
    <p>${msg}</p>
    <pre>${error ? error.stack : ''}</pre>
  </div>`
}

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (e) {
  document.body.innerHTML = `<div style="padding:20px;color:red;font-family:sans-serif">
    <h2>Sync Error</h2>
    <pre>${e.stack}</pre>
  </div>`
}
