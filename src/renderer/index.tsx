import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find root element');
}

console.log('[DEBUG] Environment:', {
  nodeEnv: process.env.NODE_ENV,
  isTest: process.env.IS_TEST,
  container: !!container
});

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log the rendered content after a short delay to ensure it's mounted
setTimeout(() => {
  console.log('[DEBUG] App mounted, container:', container.innerHTML);
  console.log('[DEBUG] App root element:', document.querySelector('[data-testid="app-root"]'));
}, 100);
