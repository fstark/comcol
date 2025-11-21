#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting Docker deployment to stark.fr..."

# Configuration
SERVER="stark.fr"
IMAGE_NAME="comcol:latest"
CONTAINER_NAME="comcol"
PROJECT_ROOT="/home/fred/Development/comcol"

cd "$PROJECT_ROOT"

# Step 1: Build Docker image
echo "📦 Building Docker image..."
./build.sh

# Step 2: Save and compress the image
echo "💾 Saving Docker image..."
docker save "$IMAGE_NAME" | gzip > /tmp/comcol-latest.tar.gz

# Step 3: Copy image to server
echo "📤 Copying image to server..."
scp /tmp/comcol-latest.tar.gz "$SERVER:/tmp/"

# Step 4: Deploy on server
echo "🚀 Deploying on server..."
ssh "$SERVER" << 'ENDSSH'
    # Load the Docker image
    echo "Loading Docker image..."
    docker load < /tmp/comcol-latest.tar.gz
    
    # Stop and remove old container
    echo "Stopping old container..."
    docker stop comcol 2>/dev/null || true
    docker rm comcol 2>/dev/null || true
    
    # Run new container
    echo "Starting new container..."
    docker run -d \
        --name comcol \
        --restart unless-stopped \
        -p 8080:8080 \
        comcol:latest

#        -e COMCOL_WRITE=1 \


    # Clean up
    rm /tmp/comcol-latest.tar.gz
    
    echo "✅ Container started successfully!"
    docker ps | grep comcol
ENDSSH

# Clean up local temp file
rm /tmp/comcol-latest.tar.gz

echo ""
echo "✅ Deployment complete!"
echo "The app is running on the server at port 8080"
echo "Access it via nginx proxy at: http://stark.fr/computers/"
echo ""
echo "To check logs: ssh $SERVER 'docker logs comcol'"
echo "To restart: ssh $SERVER 'docker restart comcol'"
