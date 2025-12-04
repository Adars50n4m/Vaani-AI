import os
import sys

# Install static-ffmpeg to ensure audio libraries work on Azure
try:
    import static_ffmpeg
    static_ffmpeg.add_paths()
    print("✅ static-ffmpeg paths added")
except ImportError:
    print("⚠️ static-ffmpeg not found, skipping")

# Add backend to path so we can import app
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app import app

if __name__ == "__main__":
    app.run()
