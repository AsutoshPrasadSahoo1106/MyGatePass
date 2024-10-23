// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Your global styles
import { RecoilRoot } from 'recoil'; // Import Recoil

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RecoilRoot> {/* Wrap your app with RecoilRoot */}
      <App />
    </RecoilRoot>
  </React.StrictMode>
);
