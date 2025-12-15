#!/usr/bin/env bash
set -e

REGISTRY="$1"
IMAGE_NAME="$2"
CONTAINER_NAME="$3"
APP_PORT="$4"
HOST_PORT="$5"

echo "Pulling latest image..."
docker pull "$REGISTRY/$IMAGE_NAME:latest"

echo "Stopping old container..."
docker stop "$CONTAINER_NAME" || true
docker rm "$CONTAINER_NAME" || true

echo "Starting new container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$HOST_PORT:$APP_PORT" \
  --restart unless-stopped \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  --health-start-period=40s \
  "$REGISTRY/$IMAGE_NAME:latest"

# Wait for container to become healthy (optional)
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" | grep -q "healthy"; then
    echo "✓ App is healthy!"
    exit 0
  fi
  attempt=$((attempt + 1))
  echo "Attempt $attempt/$max_attempts: waiting for app..."
  sleep 2
done
echo "✗ App failed to become healthy!"
docker logs "$CONTAINER_NAME"
docker stop "$CONTAINER_NAME"
exit 1
