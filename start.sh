#!/bin/bash

# ChatterBox WebUI Startup Script

echo "🎤 Starting ChatterBox WebUI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3.10 &> /dev/null; then
    echo "❌ Python 3.10+ is not installed. Please install Python 3.10+ first."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "chatterbox_env" ]; then
    echo "🐍 Creating virtual environment..."
    python3.10 -m venv chatterbox_env
fi

# Activate virtual environment
echo "🐍 Activating virtual environment..."
source chatterbox_env/bin/activate

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Install backend dependencies if needed
if [ ! -f "chatterbox_env/lib/python3.10/site-packages/flask/__init__.py" ]; then
    echo "🐍 Installing backend dependencies..."
    pip install -r backend/requirements.txt
fi

# Start backend server in background
echo "🚀 Starting backend server..."
cd backend && python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start frontend development server
echo "🌐 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ ChatterBox WebUI is running!"
echo "🎯 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo ""
echo "📝 Note: Currently using mock models for demo purposes"
echo "   To use real ChatterBox models, install the chatterbox package"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait