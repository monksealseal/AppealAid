#!/bin/bash
# AppealAid deployment preparation script

# Set script to exit on error
set -e

echo "Preparing AppealAid for deployment..."

# Create necessary directories
mkdir -p /home/esima/cc1/AppealAid/backend/logs
mkdir -p /home/esima/cc1/AppealAid/backend/uploads

# Update backend .env with production settings
echo "Updating backend .env for production..."
cat > /home/esima/cc1/AppealAid/backend/.env << EOF
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://YOUR_MONGO_USERNAME:YOUR_MONGO_PASSWORD@cluster0.mongodb.net/appealaid?retryWrites=true&w=majority
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=30d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
USE_MOCK_DB=false
MOCK_MONGO=false
CORS_ORIGIN=https://YOUR_FRONTEND_DOMAIN.com
EOF

# Add Procfile for Heroku
echo "Creating Procfile for Heroku..."
echo "web: node server.js" > /home/esima/cc1/AppealAid/backend/Procfile

# Create MongoDB connection test script
echo "Creating MongoDB connection test script..."
cat > /home/esima/cc1/AppealAid/backend/scripts/test-mongo.js << EOF
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB Connected successfully!');
    console.log(\`Connected to database: \${conn.connection.name}\`);
    console.log(\`MongoDB host: \${conn.connection.host}\`);
    
    return conn;
  } catch (error) {
    console.error(\`Error connecting to MongoDB: \${error.message}\`);
    process.exit(1);
  }
};

// Connect to database and then close connection
const testConnection = async () => {
  const conn = await connectDB();
  console.log('Connection test successful. Closing connection...');
  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
};

testConnection();
EOF

# Create setup script for MongoDB Atlas
mkdir -p /home/esima/cc1/AppealAid/scripts
cat > /home/esima/cc1/AppealAid/scripts/setup-mongodb-atlas.md << EOF
# Setting up MongoDB Atlas for AppealAid

Follow these steps to set up your MongoDB Atlas database:

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas/register
2. Create a new cluster (free tier is fine for starting)
3. Create a database user:
   - Go to Database Access > Add New Database User
   - Username: appealaid_user
   - Password: [generate a secure password]
   - Database User Privileges: Read and write to any database
   - Click "Add User"

4. Set up network access:
   - Go to Network Access > Add IP Address
   - For development: Add your current IP address
   - For production: Add 0.0.0.0/0 (to allow access from anywhere)
   - Click "Confirm"

5. Get your connection string:
   - Go to Clusters > Connect
   - Choose "Connect your application"
   - Driver: Node.js
   - Version: 4.0 or later
   - Copy the connection string

6. Update your .env file with the connection string:
   - Replace "YOUR_MONGO_USERNAME" with "appealaid_user"
   - Replace "YOUR_MONGO_PASSWORD" with your password

7. Test the connection:
   - Run: node scripts/test-mongo.js
EOF

# Create basic monitoring and logging enhancements
echo "Setting up enhanced logging..."
cat > /home/esima/cc1/AppealAid/backend/utils/monitor.js << EOF
const os = require('os');
const logger = require('./logger');

// Basic system monitoring
const monitor = {
  // Log system info on startup
  logSystemInfo: () => {
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: \`\${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB\`,
      freeMemory: \`\${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB\`,
      uptime: \`\${Math.floor(os.uptime() / 3600)} hours\`,
      hostname: os.hostname()
    };
    
    logger.info('System information:', systemInfo);
  },
  
  // Log resource usage periodically
  startMonitoring: (interval = 3600000) => { // Default: every hour
    monitor.logSystemInfo();
    
    // Log resource usage at interval
    setInterval(() => {
      const usage = {
        freeMemory: \`\${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB\`,
        loadAvg: os.loadavg(),
        uptime: \`\${Math.floor(os.uptime() / 3600)} hours\`
      };
      
      logger.info('Resource usage:', usage);
    }, interval);
  }
};

module.exports = monitor;
EOF

# Update frontend .env for production
echo "Updating frontend .env for production..."
cat > /home/esima/cc1/AppealAid/frontend/.env << EOF
REACT_APP_API_URL=https://YOUR_BACKEND_DOMAIN.com/api
REACT_APP_USE_MOCK_API=false
EOF

# Create netlify.toml for frontend deployment
echo "Creating netlify.toml for Netlify deployment..."
cat > /home/esima/cc1/AppealAid/frontend/netlify.toml << EOF
[build]
  command = "npm run build"
  publish = "build"

[context.production.environment]
  REACT_APP_API_URL = "https://YOUR_BACKEND_DOMAIN.com/api"
  REACT_APP_USE_MOCK_API = "false"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF

# Create deploy instructions
echo "Creating detailed deployment instructions..."
cat > /home/esima/cc1/AppealAid/DEPLOY_INSTRUCTIONS.md << EOF
# AppealAid Deployment Instructions

## Prerequisites

- MongoDB Atlas account
- Heroku account (or another Node.js hosting service)
- Netlify or Vercel account
- Git repository

## Step 1: Set Up MongoDB Atlas

Follow instructions in \`/scripts/setup-mongodb-atlas.md\`

## Step 2: Deploy Backend to Heroku

1. Install Heroku CLI if not already installed:
   \`\`\`
   npm install -g heroku
   \`\`\`

2. Login to Heroku:
   \`\`\`
   heroku login
   \`\`\`

3. Create a new Heroku app:
   \`\`\`
   cd backend
   heroku create appealaid-api
   \`\`\`

4. Set environment variables:
   \`\`\`
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI=<your-mongodb-atlas-uri>
   heroku config:set JWT_SECRET=<your-jwt-secret>
   heroku config:set USE_MOCK_DB=false
   heroku config:set MOCK_MONGO=false
   heroku config:set CORS_ORIGIN=<your-frontend-url>
   \`\`\`

5. Deploy to Heroku:
   \`\`\`
   git subtree push --prefix backend heroku main
   \`\`\`
   
   If deploying from a subdirectory, use:
   \`\`\`
   git push heroku \`git subtree split --prefix backend main\`:main --force
   \`\`\`

## Step 3: Deploy Frontend to Netlify

1. Push your code to GitHub

2. Login to Netlify and create a new site from Git:
   - Connect to your GitHub repository
   - Base directory: frontend
   - Build command: npm run build
   - Publish directory: build

3. Add environment variables in Netlify dashboard:
   - REACT_APP_API_URL: https://your-heroku-app-name.herokuapp.com/api
   - REACT_APP_USE_MOCK_API: false

## Step 4: Final Setup

1. Update the CORS_ORIGIN on Heroku to match your Netlify domain:
   \`\`\`
   heroku config:set CORS_ORIGIN=https://your-netlify-domain.netlify.app
   \`\`\`

2. Update the REACT_APP_API_URL on Netlify to point to your Heroku app:
   - Go to Site settings > Build & deploy > Environment
   - Add variable: REACT_APP_API_URL = https://your-heroku-app-name.herokuapp.com/api
   - Trigger a new deploy

## Step 5: Test The Application

1. Navigate to your Netlify domain
2. Test user registration and login
3. Test all major features

## Troubleshooting

- If you encounter CORS issues, double-check that CORS_ORIGIN is set correctly
- If authentication fails, verify JWT_SECRET is properly set
- For database connection issues, check MongoDB Atlas connection string and network settings
EOF

# Build the frontend for production
echo "Building frontend for production..."
cd /home/esima/cc1/AppealAid/frontend
npm run build

echo "AppealAid deployment preparation complete!"
echo "Review and follow the instructions in DEPLOY_INSTRUCTIONS.md to deploy the application."