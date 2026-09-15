import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CinemaProvider } from './context/CinemaContext.jsx';
import './styles/base.css';
import './styles/layout.css';
import './styles/home.css';
import './styles/booking.css';
import './styles/admin.css';
import './styles/status.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CinemaProvider>
        <App />
      </CinemaProvider>
    </BrowserRouter>
  </React.StrictMode>
);
