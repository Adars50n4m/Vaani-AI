#!/bin/bash

# Vaani AI - Mac GPU (MPS) Launcher
# Use this script to run the app natively on your Mac to leverage the GPU/Neural Engine.

echo "🚀 initializing Vaani AI for Mac GPU (MPS)..."
echo "------------------------------------------------"

# 1. Environment Checks
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install it."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it."
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo "📦 ffmpeg not found. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install ffmpeg
        echo "✅ ffmpeg installed."
    else
        echo "❌ Homebrew not found. Please install ffmpeg manually: 'brew install ffmpeg'"
        exit 1
    fi
fi

# 2. Backend Setup
echo "🐍 Setting up Python Backend..."
cd backend

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "📦 Installing/Updating Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# 3. Frontend Setup
echo "------------------------------------------------"
echo "⚛️ Setting up React Frontend..."
cd ..
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node dependencies..."
    npm install
fi

# 4. Start Services
echo "------------------------------------------------"
echo "🔥 Starting Vaani AI..."
echo "------------------------------------------------"

# Kill existing processes on ports if any
if lsof -i :8000 -t >/dev/null; then
    echo "⚠️  Port 8000 is busy. Killing existing process..."
    kill -9 $(lsof -i :8000 -t)
fi

if lsof -i :3000 -t >/dev/null; then
    echo "⚠️  Port 3000 is busy. Killing existing process..."
    kill -9 $(lsof -i :3000 -t)
fi

echo "👉 Backend: http://localhost:8000"
echo "👉 Frontend: http://localhost:3000"
echo "------------------------------------------------"

# Trap Ctrl+C to kill both processes
trap 'kill $BACKEND_PID; exit' SIGINT

# Start Backend
cd backend
export PORT=8000
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES # Fix for Mac forking safety
python app.py &
BACKEND_PID=$!

# Start Frontend
cd ..
npm run dev

# Wait for backend
wait $BACKEND_PID
