/**
 * AppealAid GitHub Pages Router
 * 
 * Handles direct URL access for all routes, including dynamic routes.
 * This script is embedded in all HTML files to ensure consistent routing behavior.
 */

(function() {
  // Define the base path for GitHub Pages
  const basePath = '/AppealAid';
  
  // Get the current path without the base path
  let currentPath = window.location.pathname;
  currentPath = currentPath.replace(new RegExp(`^${basePath}`), '');
  
  // Make sure path starts with a slash
  if (currentPath.charAt(0) !== '/') {
    currentPath = '/' + currentPath;
  }
  
  // Handle specific routes that need special treatment
  if (currentPath.startsWith('/appeals/ai-generator')) {
    console.log('AI Generator route detected');
    sessionStorage.setItem('redirectPath', '/appeals/ai-generator');
  } else if (currentPath.match(/^\/documents\/\d+/)) {
    // Document ID route pattern
    const documentId = currentPath.split('/')[2];
    console.log(`Document ID route detected: ${documentId}`);
    sessionStorage.setItem('redirectPath', `/documents/${documentId}`);
  } else if (currentPath.match(/^\/appeals\/\d+/)) {
    // Appeal ID route pattern
    const appealId = currentPath.split('/')[2];
    console.log(`Appeal ID route detected: ${appealId}`);
    sessionStorage.setItem('redirectPath', `/appeals/${appealId}`);
  } else {
    // Standard routes
    console.log(`Standard route detected: ${currentPath}`);
    sessionStorage.setItem('redirectPath', currentPath);
  }
  
  // Add query parameters if any
  if (window.location.search) {
    const path = sessionStorage.getItem('redirectPath');
    sessionStorage.setItem('redirectPath', path + window.location.search);
  }
  
  // Add hash fragment if any
  if (window.location.hash) {
    const path = sessionStorage.getItem('redirectPath');
    sessionStorage.setItem('redirectPath', path + window.location.hash);
  }
  
  console.log('Redirecting to app root. Path stored:', sessionStorage.getItem('redirectPath'));
  
  // Redirect to the main app
  window.location.href = basePath + '/';
})();