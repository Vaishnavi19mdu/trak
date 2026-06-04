import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ViolationProvider } from './context/ViolationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ViolationProvider>
      <App />
    </ViolationProvider>
  </StrictMode>,
);