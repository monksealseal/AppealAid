import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';
import './index.css';

// Check if we're running on GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');
const basename = isGitHubPages ? '/AppealAid' : '';

// Check for redirect from 404.html
const redirectPath = sessionStorage.getItem('redirectPath');
if (redirectPath) {
  sessionStorage.removeItem('redirectPath'); // Clear it after use
  console.log('Redirecting to:', redirectPath);
  window.history.replaceState(null, null, basename + redirectPath);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);