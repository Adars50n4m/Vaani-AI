#!/bin/bash

# Double-click friendly launcher for macOS
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "Opening ChatterBox full stack (frontend + backend)..."
exec "$DIR/start_full_stack.sh"
