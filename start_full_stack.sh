#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "🚀 Starting ChatterBox full stack (frontend + backend)..."

# Detect Python
PYTHON_BIN="${PYTHON_BIN:-python3}"
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  if command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
  else
    echo "❌ Python 3 is required but not found. Set PYTHON_BIN to your interpreter."
    exit 1
  fi
fi

# Create virtual environment if needed
if [[ ! -d "chatterbox_env" ]]; then
  echo "🐍 Creating Python virtual environment..."
  "$PYTHON_BIN" -m venv chatterbox_env
fi

echo "🐍 Activating virtual environment..."
source chatterbox_env/bin/activate

echo "📦 Installing backend dependencies (if needed)..."
pip install --upgrade pip >/dev/null
pip install -r backend/requirements.txt >/dev/null

echo "📦 Installing frontend dependencies (if needed)..."
npm install >/dev/null

echo "🛠  Launching backend..."
python backend/app.py &
BACKEND_PID=$!

echo "🌐 Launching frontend..."
npm run dev &
FRONTEND_PID=$!

cleanup() {
  echo
  echo "🛑 Stopping services..."
  kill "$BACKEND_PID" "$FRONTEND_PID" >/dev/null 2>&1 || true
  exit 0
}

trap cleanup SIGINT SIGTERM

echo
echo "✅ Frontend running at http://localhost:3000"
echo "✅ Backend running at http://localhost:8000"
echo "Press Ctrl+C to stop both."
wait
