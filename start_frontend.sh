#!/bin/bash

# Start the React frontend server for local development
# Run this script from the comcol root directory

cd frontend/comcol_frontend

# Check if node_modules exists, install if it doesn't
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Start React development server
echo "Starting React frontend..."
echo "Application will be available at http://localhost:3000/computers"
npm start
