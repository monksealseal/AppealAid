#!/bin/bash
# AppealAid Local Deployment Script

echo "================================================"
echo "AppealAid - Local Deployment"
echo "================================================"

# Kill existing processes
echo "Stopping existing processes..."
pkill -f "node.*server.js" || true
pkill -f "serve -s build" || true

# Start backend server
echo "Starting backend server..."
cd /home/esima/cc1/AppealAid/backend
NODE_ENV=production nohup node server.js > server.log 2>&1 &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Wait for backend to initialize
sleep 3

# Start frontend server
echo "Starting frontend server..."
cd /home/esima/cc1/AppealAid/frontend
nohup serve -s build -l 3001 > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"

# Display URLs
echo ""
echo "================================================"
echo "AppealAid is now available at:"
echo "Frontend: http://localhost:3001"
echo "Backend API: http://localhost:5000"
echo "================================================"
echo ""
echo "To stop the servers, run: bash stop-servers.sh"
echo ""
echo "Backend logs: tail -f /home/esima/cc1/AppealAid/backend/server.log"
echo "Frontend logs: tail -f /home/esima/cc1/AppealAid/frontend/frontend.log"