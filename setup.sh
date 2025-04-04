#!/bin/bash
# AppealAid - Master Setup Script

echo "================================================"
echo "AppealAid - Setup and Deployment Preparation"
echo "================================================"

echo "This script will prepare the AppealAid application for deployment."
echo "Press Enter to continue or Ctrl+C to abort..."
read

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p /home/esima/cc1/AppealAid/backend/logs
mkdir -p /home/esima/cc1/AppealAid/backend/uploads
mkdir -p /home/esima/cc1/AppealAid/scripts

# Install dependencies
echo "Installing dependencies..."
bash /home/esima/cc1/AppealAid/install-dependencies.sh

# Set up environment files
echo "Setting up environment files..."
cp /home/esima/cc1/AppealAid/backend/.env.template /home/esima/cc1/AppealAid/backend/.env
cp /home/esima/cc1/AppealAid/frontend/.env.template /home/esima/cc1/AppealAid/frontend/.env

echo "Preparing deployment files..."
bash /home/esima/cc1/AppealAid/prepare-deploy.sh

echo "================================================"
echo "Setup complete!"
echo "================================================"
echo
echo "To deploy the application:"
echo "1. Review and follow the instructions in DEPLOY_INSTRUCTIONS.md"
echo "2. Update the MongoDB connection string in backend/.env"
echo "3. Update the API URL in frontend/.env"
echo
echo "For local development:"
echo "1. Start the backend: cd backend && npm run dev"
echo "2. Start the frontend: cd frontend && npm start"
echo
echo "Thank you for using AppealAid!"