# 📁 ChatterBox Project Structure

Clean and organized project layout.

## 🎯 Main Files

### Backend
```
backend/
├── ai_agent.py          # AI Agent (Google Gemini + ChatterBox TTS)
└── app.py               # ChatterBox TTS/VC API
```

### Frontend
```
src/
├── components/
│   ├── AIAgentPanel.jsx      # AI Agent UI
│   ├── TTSSection.jsx        # Text-to-Speech UI
│   ├── VCSection.jsx         # Voice Conversion UI
│   └── ui/                   # Reusable UI components
├── App.jsx                   # Main React app
└── index.css                 # Global styles
```

### Test & Setup
```
ai_agent_test.html       # Standalone AI agent test (any browser)
start_ai_agent.sh        # Quick start script
setup_local_agent.sh     # Full model installation (~7GB)
```

### Documentation
```
README.md                # Main project README
AI_AGENT_README.md       # AI Agent documentation
PROJECT_STRUCTURE.md     # This file
LOCAL_AGENT_GUIDE.md     # Advanced setup guide
```

---

## 🚀 Quick Commands

### Start Everything
```bash
./start_ai_agent.sh
```

### Start Manually

**Backend:**
```bash
python backend/ai_agent.py
```

**Frontend:**
```bash
npm run dev
```

### Test
```bash
open ai_agent_test.html
```

---

## 🗂️ What Each File Does

### Core Backend Files

**`backend/ai_agent.py`**
- AI conversation agent
- Google Gemini API integration
- ChatterBox TTS for voice output
- WebSocket server for real-time chat
- Port: 9000

**`backend/app.py`**
- ChatterBox TTS API
- Voice Conversion API
- Port: 8000

### Core Frontend Files

**`src/App.jsx`**
- Main React application
- Navigation and routing
- Menu system

**`src/components/AIAgentPanel.jsx`**
- AI Agent interface
- Chat UI
- Voice playback
- WebSocket client

**`src/components/TTSSection.jsx`**
- Text-to-Speech interface
- Parameter controls
- Audio recording

**`src/components/VCSection.jsx`**
- Voice Conversion interface
- File upload
- Audio preview

### Test Files

**`ai_agent_test.html`**
- Standalone test page
- Works in any browser
- No build required
- Direct backend testing

### Setup Files

**`start_ai_agent.sh`**
- One-command startup
- Starts backend + frontend
- Auto-cleanup on exit

**`setup_local_agent.sh`**
- Installs advanced models
- ~7GB download
- Optional for offline mode

---

## 📊 Port Usage

| Service | Port | Purpose |
|---------|------|---------|
| AI Agent Backend | 9000 | Gemini + TTS |
| ChatterBox Backend | 8000 | TTS/VC API |
| React Frontend | 3001 | Web UI |

---

## 🎯 Development Workflow

### 1. Start Development
```bash
./start_ai_agent.sh
```

### 2. Make Changes
- Edit files in `src/` or `backend/`
- Hot reload enabled

### 3. Test
- Main UI: http://localhost:3001
- Test page: ai_agent_test.html
- API: http://localhost:9000/api/health

### 4. Stop
- Press Ctrl+C in terminal

---

## 🧹 Cleaned Up (Removed)

These files/folders were removed as they're no longer needed:

### Scripts & Test Files
- ❌ `quick_setup.sh` (replaced by setup_local_agent.sh)
- ❌ `test_simple.html` (replaced by ai_agent_test.html)
- ❌ `test_agent.html` (replaced by ai_agent_test.html)
- ❌ `test_*.wav` (test audio files)

### Backend Files
- ❌ `backend/local_agent.py` (incomplete, replaced by ai_agent.py)
- ❌ `backend/local_agent_mock.py` (replaced by ai_agent.py)
- ❌ `backend/local_agent_hybrid.py` (renamed to ai_agent.py)

### Gradio Apps (Cleaned)
- ❌ `chatterbox/gradio_tts_app.py` (replaced by React UI)
- ❌ `chatterbox/gradio_vc_app.py` (replaced by React UI)
- ✅ `chatterbox/multilingual_app.py` (kept - useful for testing)

### Documentation
- ❌ `LOCAL_AGENT_GUIDE.md` (merged into AI_AGENT_README.md)
- ❌ `INSTALL_HINDI_AGENT.md` (merged into AI_AGENT_README.md)

### Large Unused Folders
- ❌ `agents-js/` (940MB - LiveKit not needed, using local agent)

---

## 📝 Configuration Files

**`.env.agent`**
```bash
GOOGLE_GEMINI_API_KEY=your_key_here
```

**`package.json`**
- Frontend dependencies
- Build scripts

**`vite.config.js`**
- Vite configuration
- Dev server settings

---

## 🎨 UI Components

```
src/components/ui/
├── SpotlightCard.jsx    # Card with spotlight effect
├── MagicBento.jsx       # Bento grid layout
├── AudioPlayer.jsx      # Audio playback controls
└── FileUpload.jsx       # Drag-and-drop upload
```

---

## 🔧 Dependencies

### Backend
- FastAPI
- ChatterBox TTS
- httpx (for Gemini API)
- uvicorn

### Frontend
- React
- Vite
- Framer Motion
- Tailwind CSS
- Axios

---

**Everything is clean and organized! 🎉**
