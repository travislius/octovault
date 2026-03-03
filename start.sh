#!/bin/bash
# OctoCloud startup script (native, no Docker)
# Copy .env.example to .env and fill in your values before running

cd "$(dirname "$0")"

# Load .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set defaults if not provided
export OCTOCLOUD_USERNAME=${OCTOCLOUD_USERNAME:-admin}
export OCTOCLOUD_PASSWORD=${OCTOCLOUD_PASSWORD:-changeme}
export OCTOCLOUD_SECRET=${OCTOCLOUD_SECRET:-$(openssl rand -hex 32)}
export OCTOCLOUD_STORAGE=${OCTOCLOUD_STORAGE:-$(pwd)/data/files}
export OCTOCLOUD_DB=${OCTOCLOUD_DB:-$(pwd)/data/octocloud.db}
export OCTOCLOUD_MAX_UPLOAD_MB=${OCTOCLOUD_MAX_UPLOAD_MB:-500}
export OCTOCLOUD_PORT=${OCTOCLOUD_PORT:-5679}

mkdir -p "$OCTOCLOUD_STORAGE"

exec backend/venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port "$OCTOCLOUD_PORT"
