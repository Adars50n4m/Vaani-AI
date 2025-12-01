# ChatterBox WebUI 🎤

A beautiful, modern React-based web interface for ChatterBox TTS (Text-to-Speech), Voice Conversion, and AI Voice Agent.

## ✨ Features

### 🤖 AI Voice Agent (NEW!)
- **Conversational AI** powered by Google Gemini
- **Hindi + English** bilingual support
- **Real-time chat** with voice output
- **ChatterBox TTS** for natural Hindi speech
- See [AI_AGENT_README.md](AI_AGENT_README.md) for details

### 🎯 Text-to-Speech (TTS)
- Convert text to natural-sounding speech
- Upload reference audio for voice cloning
- Advanced parameter controls (exaggeration, temperature, CFG weight, etc.)
- Real-time audio recording
- Beautiful waveform visualization

### 🔄 Voice Conversion (VC)
- Convert one voice to another
- Support for custom target voices
- Drag-and-drop audio upload
- Preview source and target audio

### 🎨 Beautiful UI/UX
- Modern glassmorphism design
- Smooth animations with Framer Motion
- Floating particles background
- Responsive layout
- Real-time audio player with controls
- Toast notifications

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher) ✅ Installed
- Python 3.10+ ✅ Installed
- ChatterBox models (TTS and VC) - Optional for demo

### Installation & Setup

1. **Run the startup script (Linux/macOS):**
   ```bash
   ./start.sh
   ```

   This will:
   - Create Python virtual environment
   - Install all dependencies
   - Start the backend API server (port 8000)
   - Start the frontend development server (port 3000)

2. **One-click full stack runner (alternative):**
   - macOS/Linux: `./start_full_stack.sh`
   - Windows: double-click `start_full_stack.bat`

   This single command installs dependencies (if needed) and launches backend + frontend together. Stop both by pressing `Ctrl+C` (macOS/Linux) or closing the opened CMD windows (Windows).

3. **Access the application:**
   - Frontend: http://localhost:3000 ✅ Running
   - Backend API: http://localhost:8000 ✅ Running

### Current Status
- ✅ **Frontend**: Beautiful React UI with dark mode and animations
- ✅ **Backend**: Flask API server with real ChatterBox integration
- ✅ **Virtual Environment**: Python 3.10 environment created
- ✅ **TTS**: Real ChatterBox TTS with voice cloning support
- ✅ **Voice Cloning**: Upload reference audio to clone any voice
- ✅ **Language Support**: Advanced AI-powered multilingual synthesis
- ✅ **Voice Conversion**: Real ChatterBox VC model loaded
- 🎯 **Status**: Full ChatterBox functionality enabled!

### Manual Setup (Alternative)

If you prefer to run components separately:

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
npm install
npm run dev
```

## 🎛️ Usage

### Text-to-Speech
1. Switch to the "Text to Speech" tab
2. Enter your text (max 300 characters)
3. Optionally upload a reference audio file for voice cloning
4. Adjust parameters like exaggeration and temperature
5. Click "Generate Speech" to create audio
6. Play, download, or share your generated speech

### Voice Conversion
1. Switch to the "Voice Conversion" tab
2. Upload the source audio you want to convert
3. Optionally upload a target voice sample
4. Click "Convert Voice" to process
5. Preview and download the converted audio

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Framer Motion** - Smooth animations
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **React Dropzone** - File upload handling
- **Axios** - HTTP client

### Backend
- **Flask** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **PyTorch** - Deep learning framework
- **ChatterBox TTS/VC** - AI models

## 📁 Project Structure

```
ChatterBox 2/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── services/          # API services
│   └── main.jsx           # App entry point
├── backend/               # Flask backend
│   ├── app.py            # Main API server
│   └── requirements.txt   # Python dependencies
├── chatterbox/           # Original ChatterBox modules
├── package.json          # Node.js dependencies
├── start.sh             # Startup script
└── README.md            # This file
```

## 🎨 UI Components

- **Header** - Animated logo and title
- **TabNavigation** - Smooth tab switching
- **TTSPanel** - Text-to-speech interface
- **VCPanel** - Voice conversion interface
- **AudioUpload** - Drag-and-drop file upload
- **AudioPlayer** - Custom audio player with controls
- **FloatingParticles** - Animated background

## ⚙️ Configuration

### Backend Configuration
- **Device**: Automatically detects CUDA/CPU
- **File Size Limit**: 50MB max upload
- **Supported Formats**: WAV, MP3, FLAC, M4A, OGG
- **API Timeout**: 2 minutes for generation

### Frontend Configuration
- **Development Port**: 3000
- **API Proxy**: Automatically proxies to backend
- **Build Output**: `dist/` directory

## 🔧 Development

### Adding New Features
1. Frontend components go in `src/components/`
2. API endpoints go in `backend/app.py`
3. Styling uses Tailwind CSS classes
4. Animations use Framer Motion

### Building for Production
```bash
npm run build
```

### API Endpoints
- `GET /api/health` - Health check
- `POST /api/tts/generate` - Generate TTS audio
- `POST /api/vc/generate` - Convert voice

## 🎯 Performance Tips

- Models are pre-loaded on server startup for faster response
- Audio files are processed in memory to avoid disk I/O
- Frontend uses lazy loading and code splitting
- Animations are GPU-accelerated where possible

## 🐛 Troubleshooting

### Common Issues
1. **Models not loading**: Ensure ChatterBox models are properly installed
2. **CUDA errors**: Check PyTorch CUDA compatibility
3. **Port conflicts**: Change ports in configuration files
4. **File upload fails**: Check file size and format

### Debug Mode
Run backend with debug logging:
```bash
cd backend
FLASK_DEBUG=1 python app.py
```

## 📄 License

This project extends the original ChatterBox implementation with a modern web interface.

---

**Enjoy creating amazing voices with ChatterBox WebUI! 🎤✨**

## 🎯 **Voice Cloning SUCCESS! 🎉**

### ✅ **FULLY WORKING:**
- **Real Voice Cloning**: Upload any reference audio to clone voices
- **ChatterBox TTS**: Advanced AI model with PerthNet loaded
- **Voice Conversion**: Real ChatterBox VC model active
- **Advanced Parameters**: Full control over exaggeration, temperature, CFG weight

### 🎤 **Voice Cloning Features:**
- **Any Voice**: Clone any voice from reference audio
- **High Quality**: Professional-grade AI voice synthesis
- **Real-time**: Generate cloned speech in seconds
- **Advanced Controls**: Fine-tune voice characteristics

### 🚀 **How Voice Cloning Works:**
1. **Upload Reference**: Any audio file with target voice
2. **Enter Text**: What you want the cloned voice to say
3. **Adjust Settings**: Exaggeration, temperature, etc.
4. **Generate**: AI clones the voice and speaks your text
5. **Download**: High-quality WAV output

### 🔧 **Technical Achievement:**
- **ChatterboxTTS**: Real AI model loaded successfully
- **PerthNet**: Implicit model at step 250,000
- **Voice Conversion**: ChatterboxVC model active
- **Full Pipeline**: Complete voice cloning and conversion

---

**🎉 Voice cloning ab fully working hai! Upload करके test करें! 🎤✨**
