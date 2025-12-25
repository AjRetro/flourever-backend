import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // This imports our Tailwind styles
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <-- 1. IMPORT THE "BRAIN"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <-- 2. WRAP YOUR APP WITH THE "BRAIN" */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
