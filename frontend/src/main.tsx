import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

console.log('==== MAIN.TSX LOADING ====');

try {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('==== REACT APP MOUNTED ====');
  }
} catch (error) {
  console.error('React mount error:', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="color:red;padding:20px;"><h1>Error</h1><pre>${error}</pre></div>`;
  }
}
