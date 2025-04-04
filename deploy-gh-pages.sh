#!/bin/bash
# Deploy AppealAid to GitHub Pages

echo "================================================"
echo "AppealAid - GitHub Pages Deployment"
echo "================================================"

# Ensure we're in the right directory
cd /home/esima/cc1/AppealAid

# Create a deployment directory
mkdir -p docs

# Build the frontend with mocks enabled
echo "Building frontend for static deployment..."
cd frontend

# Ensure .env has mock API enabled
sed -i 's/REACT_APP_USE_MOCK_API=false/REACT_APP_USE_MOCK_API=true/g' .env

# Build the React app
npm run build

# Copy the build to docs directory
echo "Copying build files to docs directory..."
cp -r build/* ../docs/

# Create a .nojekyll file to prevent GitHub from processing the site with Jekyll
touch ../docs/.nojekyll

# Create a simple 404.html that redirects to index.html
cat > ../docs/404.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to AppealAid</title>
  <script>
    sessionStorage.setItem('redirectPath', window.location.pathname);
    window.location.href = '/';
  </script>
</head>
<body>
  <p>Redirecting to AppealAid...</p>
</body>
</html>
EOF

echo "================================================"
echo "Deployment preparation complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Commit changes: git add docs/ && git commit -m 'Add GitHub Pages deployment'"
echo "2. Push to GitHub: git push origin main"
echo "3. Enable GitHub Pages in your repository settings:"
echo "   - Go to Settings > Pages"
echo "   - Set Source to 'main branch' and folder to '/docs'"
echo ""
echo "Your site will be available at: https://yourusername.github.io/your-repo-name/"