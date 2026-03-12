#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Starting backend and frontend dev servers..."
npm run dev:backend &
BACKEND_PID=$!

npm run dev:frontend &
FRONTEND_PID=$!

# Kill both on Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait
