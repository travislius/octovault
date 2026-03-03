#!/bin/bash
# OctoVault startup script (native, no Docker)
# Copy .env.example to .env and fill in your values before running

cd "$(dirname "$0")"

# Load .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set defaults if not provided
export OCTOVAULT_USERNAME=${OCTOVAULT_USERNAME:-admin}
export OCTOVAULT_PASSWORD=${OCTOVAULT_PASSWORD:-changeme}
export OCTOVAULT_SECRET=${OCTOVAULT_SECRET:-$(openssl rand -hex 32)}
export OCTOVAULT_STORAGE=${OCTOVAULT_STORAGE:-$(pwd)/data/files}
export OCTOVAULT_DB=${OCTOVAULT_DB:-$(pwd)/data/octovault.db}
export OCTOVAULT_MAX_UPLOAD_MB=${OCTOVAULT_MAX_UPLOAD_MB:-500}
export OCTOVAULT_PORT=${OCTOVAULT_PORT:-5679}

mkdir -p "$OCTOVAULT_STORAGE"

source backend/venv/bin/activate
exec uvicorn backend.app.main:app --host 0.0.0.0 --port "$OCTOVAULT_PORT"
