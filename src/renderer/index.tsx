import React from 'react';
import { createRoot } from 'react-dom/client';
import { enablePatches } from 'immer';
import App from './App';
import './styles.css';

// Enable Immer patches for undo/redo functionality
enablePatches();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find root element');
}

const root = createRoot(container);
root.render(<App />);
