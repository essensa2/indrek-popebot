#!/bin/bash
# Pope Bot - Coolify pre-deploy build script
# Run this before Docker Compose starts. The event-handler container needs .next/ to exist.
set -e
echo "==> Pope Bot: Installing dependencies..."
npm install
echo "==> Pope Bot: Building Next.js app..."
npm run build
echo "==> Pope Bot: Build complete. Ready for Docker Compose."
