#!/bin/bash
# AppealAid Server Stop Script

echo "Stopping AppealAid servers..."

# Kill backend server
pkill -f "node.*server.js" && echo "Backend server stopped" || echo "No backend server running"

# Kill frontend server
pkill -f "serve -s build" && echo "Frontend server stopped" || echo "No frontend server running"

echo "All servers stopped."