#!/bin/bash
# ==========================================
# Macro-Mate Deployment Script
# ==========================================
# Run this script on the production server after pulling code.

set -e

cd ~/macro-mate

echo "=== Starting deployment ==="

# 1. Define paths
COMPOSE_FILE="./back-end/docker-compose.prod.yml"


# 2. Check files
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERROR: docker-compose file not found at $COMPOSE_FILE"
  exit 1
fi

echo "Using compose file: ${COMPOSE_FILE}"

# 3. Stop existing containers
echo "=== Stopping existing containers ==="
docker compose -f "${COMPOSE_FILE}" down || true

# 4. Build & start containers
echo "=== Building and starting containers ==="
docker compose -f "${COMPOSE_FILE}" up -d --build

# 5. Check status
echo "=== Checking container status ==="
docker compose -f "${COMPOSE_FILE}" ps

# 6. Optional: health check
echo "=== Waiting for services to become healthy ==="
sleep 10
docker ps --filter "health=unhealthy" --format "table {{.Names}}\t{{.Status}}" || true

echo "=== Deployment completed successfully ==="
echo "Access your application at: http://your-droplet-ip"
