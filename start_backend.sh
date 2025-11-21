#!/bin/bash

# Start the Django backend server for local development
# Run this script from the comcol root directory

cd backend

# Check if virtual environment exists, create if it doesn't
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import django" 2>/dev/null; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Run migrations if needed
echo "Running migrations..."
python manage.py migrate

# Enable write mode (optional - comment out for read-only mode)
export COMCOL_WRITE=1

# Start Django server
echo "Starting Django backend at http://0.0.0.0:8000"
echo "API will be available at http://localhost:8000/api/"
python manage.py runserver 0.0.0.0:8000
