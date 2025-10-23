#!/bin/bash

# Build Docker image
echo "Building Docker image..."
docker build -t macro-mate-frontend:latest .

echo "Build complete!"
echo "To run the container, use: docker-compose up -d"
echo "Or: docker run -p 3000:3000 macro-mate-frontend:latest"
