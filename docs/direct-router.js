/**
 * Direct Router for GitHub Pages
 * 
 * This script is used by all route index.html files to properly
 * handle direct URL access for React Router in GitHub Pages.
 */

// Parse the current URL
const currentPath = window.location.pathname;
const basePath = '/AppealAid';
const cleanPath = currentPath.replace(new RegExp(`^${basePath}`), '');

// Check if this is a nested route with an ID
const pathParts = cleanPath.split('/').filter(part => part);

// Store information for React Router
if (pathParts.length > 0) {
  const routeName = pathParts[0]; // e.g., 'documents', 'appeals'
  
  // If there's an ID or sub-route
  if (pathParts.length > 1) {
    const routeId = pathParts[1]; // e.g., '4', 'create'
    
    // Store the full path for React Router
    sessionStorage.setItem('redirectPath', cleanPath);
    console.log(`Direct access: ${routeName}/${routeId}. Stored path: ${cleanPath}`);
  } else {
    // Just the main route
    sessionStorage.setItem('redirectPath', `/${routeName}`);
    console.log(`Direct access: ${routeName}. Stored path: /${routeName}`);
  }
}

// Handle query parameters and hash
if (window.location.search) {
  const redirectPath = sessionStorage.getItem('redirectPath') || '';
  sessionStorage.setItem('redirectPath', `${redirectPath}${window.location.search}`);
}

if (window.location.hash) {
  const redirectPath = sessionStorage.getItem('redirectPath') || '';
  sessionStorage.setItem('redirectPath', `${redirectPath}${window.location.hash}`);
}

// Redirect to the main app
window.location.href = `${basePath}/`;