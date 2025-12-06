# Stage 1: Build React Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Python Backend & Final Image
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (ffmpeg is crucial for audio)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt ./backend/requirements.txt

# Install Python dependencies
# gunicorn is needed for production server
RUN pip install --no-cache-dir -r backend/requirements.txt && \
    pip install --no-cache-dir gunicorn

# Copy backend code
COPY backend ./backend
COPY chatterbox ./chatterbox

# Copy built frontend from Stage 1
COPY --from=frontend-build /app/frontend/dist ./dist

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV FLASK_ENV=production

# Expose the port
EXPOSE 8000

# Command to run the application
ENV STT_MODEL_NAME=base
ENV USE_LIGHTWEIGHT_TTS=false
ENV GUNICORN_CMD_ARGS="--workers 1 --threads 4 --worker-class gthread"

# Command to run the application
CMD gunicorn --bind 0.0.0.0:$PORT --timeout 600 backend.app:app
