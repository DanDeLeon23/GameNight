import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // React Router for page navigation
import App from './App'; // Home page with login button
import Dashboard from './Dashboard'; // Page to show profile after login

// Mount the React app and enable routing
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      {/* "/" route → Home page */}
      <Route path="/" element={<App />} />

      {/* "/dashboard" route → Steam profile display */}
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
);