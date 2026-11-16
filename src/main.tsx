import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './design/tokens.css';
import './design/components.css';
import './design/motion.css';
// screens last, so a screen can adjust a component without raising specificity
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
