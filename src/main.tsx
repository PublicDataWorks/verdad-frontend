import App from './App'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.scss'
import "@liveblocks/react-ui/styles.css";

const container = document.querySelector('#root')
if (container) {
  const root = createRoot(container)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
