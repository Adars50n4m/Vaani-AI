# 🚀 Quick Start Guide

## 1. Get API Keys (Choose One or Both)

### Option A: OpenAI (Recommended for Best Performance)
1. Visit https://platform.openai.com/api-keys
2. Create new API key
3. Copy the key (starts with `sk-...`)

### Option B: Google Gemini (Free Tier Available)
1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Copy the key (starts with `AIza...`)

## 2. Configure Environment

```bash
# Copy example configuration
cp .env.example .env

# Edit .env and add your API key(s)
nano .env  # or use any text editor
```

**Minimal Configuration:**
```bash
# Add at least one of these:
OPENAI_API_KEY=sk-your_key_here
# OR
GOOGLE_API_KEY=AIza_your_key_here

# Use auto mode (recommended)
LLM_PROVIDER=auto
STT_PROVIDER=auto
TTS_PROVIDER=auto
```

## 3. Start the Services

### Using the Startup Script (Easiest)
```bash
./start_ai_agent_configured.sh
```

### Manual Start
```bash
# Terminal 1: Start AI Agent Backend
python backend/ai_agent.py

# Terminal 2: Start Frontend
npm run dev
```

## 4. Test It Out

### Web UI
1. Open http://localhost:3001
2. Click Menu → AI Agent
3. Type a message or use voice input
4. Get AI response with voice output

### Test Page
1. Open `ai_agent_test.html` in your browser
2. Type a message
3. Press Enter
4. Listen to the response

## 5. Check Status

```bash
# Check if backend is running
curl http://localhost:9000/api/health

# You should see:
{
  "status": "healthy",
  "providers": {
    "openai_available": true,
    "gemini_available": true,
    "llm_provider": "openai",
    "stt_provider": "openai",
    "tts_provider": "openai"
  },
  "models": {
    "llm": "OpenAI gpt-4o-mini",
    "stt": "OpenAI whisper-1",
    "tts": "OpenAI tts-1"
  }
}
```

## Troubleshooting

### "No API keys configured"
- Edit `.env` and add at least one API key
- Make sure the key doesn't have quotes around it
- Restart the backend after editing `.env`

### "Connection refused"
- Make sure backend is running: `python backend/ai_agent.py`
- Check port 9000 is not in use: `lsof -i :9000`

### "Module not found"
```bash
# Install dependencies
pip install fastapi uvicorn httpx python-dotenv
```

### "No audio output"
- Check browser console for errors (F12)
- Make sure audio is not muted
- Try the test page: `ai_agent_test.html`

## Next Steps

- Read [AI_AGENT_CONFIG.md](AI_AGENT_CONFIG.md) for advanced configuration
- Read [AI_AGENT_README.md](AI_AGENT_README.md) for full documentation
- Experiment with different provider combinations
- Adjust model settings for your use case

## Cost Optimization

### Free Tier Setup
```bash
LLM_PROVIDER=gemini      # Free tier
STT_PROVIDER=browser     # Free (client-side)
TTS_PROVIDER=local       # Free (local model)
```

### Best Performance Setup
```bash
LLM_PROVIDER=openai      # Fastest responses
STT_PROVIDER=openai      # Most accurate
TTS_PROVIDER=openai      # Best voice quality
```

### Balanced Setup (Recommended)
```bash
LLM_PROVIDER=auto        # Reliability with fallback
STT_PROVIDER=browser     # Free + fast
TTS_PROVIDER=openai      # Best voice quality
```

---

**That's it! You're ready to chat with your AI agent! 🤖✨**
