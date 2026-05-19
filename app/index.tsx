import '@ifrc-go/ui/index.css';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

createRoot(document.getElementById('webapp-root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
