import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ThemeProvider } from './theme/ThemeContext';
import './styles/main.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={new QueryClient()}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>,
  );
}
