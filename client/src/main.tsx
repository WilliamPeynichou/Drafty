import './account-pages.css';
import './home-redesign.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

const container = document.getElementById('root');

if (!container) throw new Error('Élément racine introuvable.');

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
