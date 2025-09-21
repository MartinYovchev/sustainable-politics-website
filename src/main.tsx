import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// Add preload class to body on initial load
document.body.classList.add('is-preload');

// Remove preload class after a short delay to trigger animations
window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.remove('is-preload');
  }, 100);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
