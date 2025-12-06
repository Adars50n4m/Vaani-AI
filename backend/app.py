import os
import io
import random
import numpy as np
import torch
import json
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tempfile
import wave
import time
import subprocess
from pathlib import Path
from typing import Optional

# Set PyTorch attention implementation to avoid SDPA issues
os.environ['PYTORCH_ATTENTION_IMPLEMENTATION'] = 'eager'
os.environ['TRANSFORMERS_ATTENTION_IMPLEMENTATION'] = 'eager'
torch.backends.cuda.enable_flash_sdp(False)
torch.backends.cuda.enable_mem_efficient_sdp(False)
torch.backends.cuda.enable_math_sdp(True)

# Import TTS modules
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'chatterbox', 'src'))
try:
    from pymongo import MongoClient
except Exception:
    MongoClient = None

# Comprehensive monkey patch to force eager attention
def patch_attention_implementation():
    try:
        import transformers
        from transformers import AutoModel, AutoConfig
        from transformers.models.auto.modeling_auto import AutoModel as AutoModelClass
        
        # Patch AutoModel.from_pretrained
        original_from_pretrained = AutoModelClass.from_pretrained
        
        def patched_from_pretrained(cls, *args, **kwargs):
            kwargs['attn_implementation'] = 'eager'
            return original_from_pretrained(*args, **kwargs)
        
        AutoModelClass.from_pretrained = classmethod(patched_from_pretrained)
        
        # Patch AutoConfig.from_pretrained
        original_config_from_pretrained = AutoConfig.from_pretrained
        
        def patched_config_from_pretrained(*args, **kwargs):
            config = original_config_from_pretrained(*args, **kwargs)
            if hasattr(config, '_attn_implementation'):
                config._attn_implementation = 'eager'
            return config
        
        AutoConfig.from_pretrained = staticmethod(patched_config_from_pretrained)
        
        # Patch all model classes that might use attention
        for module_name in dir(transformers.models):
            if not module_name.startswith('_'):
                try:
                    module = getattr(transformers.models, module_name)
                    if hasattr(module, 'modeling_' + module_name):
                        modeling_module = getattr(module, 'modeling_' + module_name)
                        for class_name in dir(modeling_module):
                            if 'Model' in class_name:
                                model_class = getattr(modeling_module, class_name)
                                if hasattr(model_class, 'from_pretrained'):
                                    original_method = model_class.from_pretrained
                                    def make_patched_method(orig):
                                        def patched_method(*args, **kwargs):
                                            kwargs['attn_implementation'] = 'eager'
                                            return orig(*args, **kwargs)
                                        return patched_method
                                    model_class.from_pretrained = classmethod(make_patched_method(original_method))
                except:
                    pass
        
        print("✅ Comprehensive attention implementation patched to eager")
    except Exception as e:
        print(f"⚠️ Could not patch attention: {e}")

patch_attention_implementation()

# Try to import both TTS versions
try:
    from chatterbox.tts import ChatterboxTTS as OriginalChatterboxTTS
    from chatterbox.vc import ChatterboxVC
    ORIGINAL_TTS_AVAILABLE = True
    print("✅ Original ChatterBox TTS imported successfully")
except ImportError as e:
    print(f"❌ Could not import Original ChatterBox TTS: {e}")
    ORIGINAL_TTS_AVAILABLE = False

try:
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    MULTILINGUAL_TTS_AVAILABLE = True
    print("✅ ResembleAI Chatterbox Multilingual TTS imported successfully")
except ImportError as e:
    print(f"❌ Could not import ResembleAI Chatterbox Multilingual TTS: {e}")
    MULTILINGUAL_TTS_AVAILABLE = False

try:
    from faster_whisper import WhisperModel
    FASTER_WHISPER_AVAILABLE = True
    print("✅ faster-whisper available for STT")
except ImportError as e:
    WhisperModel = None
    FASTER_WHISPER_AVAILABLE = False
    print(f"⚠️ faster-whisper not available: {e}")

# Mock TTS for fallback
class MockMultilingualTTS:
    def __init__(self, device):
        self.sr = 22050
        self.device = device
    
    @classmethod
    def from_pretrained(cls, device):
        return cls(device)
    
    def generate(self, text, audio_prompt_path=None, **kwargs):
        # Generate a simple sine wave as demo audio
        duration = 3  # 3 seconds demo
        t = np.linspace(0, duration, int(self.sr * duration))
        frequency = 440  # A4 note
        audio = np.sin(2 * np.pi * frequency * t) * 0.3
        
        # Simulate processing time
        time.sleep(2)
        
        return torch.tensor(audio).unsqueeze(0)

# Mock VC for now
class MockChatterboxVC:
    def __init__(self, device):
        self.sr = 22050
        self.device = device
    
    @classmethod
    def from_pretrained(cls, device):
        return cls(device)
    
    def generate(self, audio_path, target_voice_path=None):
        # Generate a simple modified sine wave as demo audio
        duration = 3  # 3 seconds demo
        t = np.linspace(0, duration, int(self.sr * duration))
        frequency = 523  # C5 note (higher than TTS)
        audio = np.sin(2 * np.pi * frequency * t) * 0.3
        
        # Add some modulation to simulate voice conversion
        modulation = np.sin(2 * np.pi * 2 * t) * 0.1
        audio = audio * (1 + modulation)
        
        # Simulate processing time
        time.sleep(1)
        
        return torch.tensor(audio).unsqueeze(0)

# Set up TTS and VC classes - Use Multilingual TTS for Hindi support
# Set up TTS and VC classes - Use Multilingual TTS for Hindi support
USE_LIGHTWEIGHT_TTS = os.environ.get('USE_LIGHTWEIGHT_TTS', 'false').lower() == 'true'

if MULTILINGUAL_TTS_AVAILABLE and not USE_LIGHTWEIGHT_TTS:
    # Use Multilingual TTS for Hindi and other languages
    ChatterboxTTS = ChatterboxMultilingualTTS
    print("✅ Using ResembleAI Chatterbox Multilingual TTS (supports Hindi & 15+ languages)")
elif ORIGINAL_TTS_AVAILABLE:
    # Fallback to Original TTS (English only)
    ChatterboxTTS = OriginalChatterboxTTS
    print("⚠️ Using Original ChatterBox TTS (English only)")
else:
    # Use mock TTS as last resort
    ChatterboxTTS = MockMultilingualTTS
    print("⚠️ Using Mock TTS (no real TTS available)")

if ORIGINAL_TTS_AVAILABLE:
    print("✅ Using Original ChatterBox VC")
else:
    ChatterboxVC = MockChatterboxVC
    print("⚠️ Using Mock VC (real VC not available)")

# Initialize Flask with static folder pointing to React build
app = Flask(__name__, static_folder='../dist', static_url_path='')
CORS(app)

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Check if file exists in static folder
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Otherwise return index.html for client-side routing
    return send_from_directory(app.static_folder, 'index.html')


VOICE_LIB_DIR = Path(os.environ.get('VOICE_STORAGE_PATH', Path(__file__).resolve().parent / 'voice_library'))
VOICE_METADATA_PATH = VOICE_LIB_DIR / 'metadata.json'
VOICE_LIB_DIR.mkdir(parents=True, exist_ok=True)

def read_voice_library():
    if not VOICE_METADATA_PATH.exists():
        return []
    try:
        with VOICE_METADATA_PATH.open('r') as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
        return data.get('samples', [])
    except Exception as exc:
        print(f"⚠️ Could not read voice library: {exc}")
        return []

def write_voice_library(samples):
    try:
        payload = {'samples': samples}
        with VOICE_METADATA_PATH.open('w') as f:
            json.dump(payload, f, indent=2)
    except Exception as exc:
        print(f"⚠️ Could not write voice library: {exc}")

# Configuration - Enable Mac GPU (MPS) for faster processing
if torch.cuda.is_available():
    DEVICE = "cuda"
    print("🚀 Using NVIDIA GPU (CUDA)")
elif torch.backends.mps.is_available():
    DEVICE = "mps"
    print("🚀 Using Mac GPU (MPS)")
else:
    DEVICE = "cpu"
    print("⚠️ Using CPU (slower)")

UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac', 'm4a', 'ogg'}
STT_MODEL_NAME = os.environ.get('STT_MODEL_NAME', 'large-v3')
STT_DEVICE = os.environ.get('STT_DEVICE', 'cuda' if torch.cuda.is_available() else 'cpu')
STT_COMPUTE_TYPE = os.environ.get('STT_COMPUTE_TYPE', 'float16' if STT_DEVICE.startswith('cuda') else 'int8')
MONGO_URI = os.environ.get('MONGO_URI')
MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'vaani')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Global model instances
tts_model = None
vc_model = None
stt_model: Optional["WhisperModel"] = None
mongo_client = None
mongo_db = None
mongo_status = {'connected': False, 'error': 'Not initialized'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def set_seed(seed: int):
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    random.seed(seed)
    np.random.seed(seed)

def get_mongo_db():
    """Lazy-connect to MongoDB if configured."""
    global mongo_client, mongo_db, mongo_status
    if mongo_db:
        return mongo_db
    if not MONGO_URI:
        mongo_status = {'connected': False, 'error': 'MONGO_URI not set'}
        return None
    if MongoClient is None:
        mongo_status = {'connected': False, 'error': 'pymongo not installed'}
        return None
    try:
        import certifi
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
        # Verify connection
        mongo_client.admin.command('ping')
        mongo_db = mongo_client[MONGO_DB_NAME]
        mongo_status = {'connected': True, 'error': None, 'db': MONGO_DB_NAME}
        print(f"✅ Connected to MongoDB ({MONGO_DB_NAME})")
    except Exception as exc:
        mongo_status = {'connected': False, 'error': str(exc)}
        mongo_client = None
        mongo_db = None
        print(f"⚠️ MongoDB connection failed: {exc}")
    return mongo_db

def load_tts_model():
    global tts_model
    if tts_model is None:
        model_name = "Original ChatterBox TTS" if ORIGINAL_TTS_AVAILABLE else "ResembleAI Multilingual TTS"
        print(f"Loading {model_name} model...")
        try:
            tts_model = ChatterboxTTS.from_pretrained(DEVICE)
            print(f"✅ {model_name} model loaded successfully")
        except Exception as e:
            print(f"❌ {model_name} model failed: {e}")
            print("📝 Using mock TTS")
            tts_model = MockMultilingualTTS.from_pretrained(DEVICE)
    return tts_model

def load_vc_model():
    global vc_model
    if vc_model is None:
        print("Loading VC model...")
        try:
            vc_model = ChatterboxVC.from_pretrained(DEVICE)
            print("✅ VC model loaded successfully")
        except Exception as e:
            print(f"❌ VC model failed: {e}")
            vc_model = MockChatterboxVC.from_pretrained(DEVICE)
    return vc_model

def load_stt_model():
    global stt_model
    if not FASTER_WHISPER_AVAILABLE:
        raise RuntimeError("faster-whisper is not installed. Please run `pip install faster-whisper`.")
    if stt_model is None:
        print(f"Loading Whisper STT model '{STT_MODEL_NAME}' on {STT_DEVICE} ({STT_COMPUTE_TYPE})...")
        stt_model = WhisperModel(
            STT_MODEL_NAME,
            device=STT_DEVICE,
            compute_type=STT_COMPUTE_TYPE
        )
        print("✅ Whisper STT model loaded successfully")
    return stt_model

def transcribe_audio_file(audio_path: str, language: Optional[str] = None, task: str = 'transcribe'):
    """Run Whisper transcription on the provided audio file."""
    model = load_stt_model()
    transcription_kwargs = {
        'vad_filter': True,
        'beam_size': 5
    }
    if language:
        transcription_kwargs['language'] = language
    if task in {'transcribe', 'translate'}:
        transcription_kwargs['task'] = task

    segments, info = model.transcribe(audio_path, **transcription_kwargs)

    assembled_segments = []
    collected_text = []
    for segment in segments:
        text = segment.text.strip()
        if text:
            collected_text.append(text)
        assembled_segments.append({
            'id': segment.id,
            'start': segment.start,
            'end': segment.end,
            'text': text,
            'avg_log_prob': segment.avg_log_prob,
            'no_speech_prob': segment.no_speech_prob,
        })

    return {
        'text': ' '.join(collected_text).strip(),
        'segments': assembled_segments,
        'language': info.language,
        'language_probability': info.language_probability,
        'duration': info.duration
    }

def save_audio_to_wav(audio_data, sample_rate):
    """Convert audio data to WAV format and return as bytes"""
    buffer = io.BytesIO()
    
    # Ensure audio_data is numpy array
    if torch.is_tensor(audio_data):
        audio_data = audio_data.cpu().numpy()
    
    # Normalize audio data to 16-bit range
    if audio_data.dtype != np.int16:
        audio_data = (audio_data * 32767).astype(np.int16)
    
    # Create WAV file in memory
    with wave.open(buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data.tobytes())
    
    buffer.seek(0)
    return buffer

@app.route('/api/stt/transcribe', methods=['POST'])
def stt_transcribe():
    if not FASTER_WHISPER_AVAILABLE:
        return jsonify({'error': 'faster-whisper is not installed on this server.'}), 500

    if 'audio' not in request.files:
        return jsonify({'error': 'Audio file is required (multipart form field "audio").'}), 400

    audio_file = request.files['audio']
    if not audio_file or not audio_file.filename:
        return jsonify({'error': 'Invalid audio file.'}), 400

    if not allowed_file(audio_file.filename):
        return jsonify({'error': f'Unsupported file type: {audio_file.filename}'}), 400

    language = request.form.get('language') or None
    task = request.form.get('task', 'transcribe')

    temp_filename = secure_filename(audio_file.filename)
    temp_path = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)
    audio_file.save(temp_path)

    try:
        result = transcribe_audio_file(temp_path, language=language, task=task)
        if not result['text']:
            return jsonify({'text': '', 'segments': [], 'language': result['language'], 'language_probability': result['language_probability'], 'duration': result['duration']}), 200
        return jsonify(result)
    except Exception as exc:
        print(f"STT error: {exc}")
        return jsonify({'error': f'STT failed: {exc}'}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/api/health', methods=['GET'])
def health_check():
    get_mongo_db()
    return jsonify({
        'status': 'healthy',
        'device': DEVICE,
        'multilingual_tts_available': MULTILINGUAL_TTS_AVAILABLE,
        'tts_loaded': tts_model is not None,
        'vc_loaded': vc_model is not None,
        'tts_model_type': str(type(tts_model).__name__) if tts_model else None,
        'vc_model_type': str(type(vc_model).__name__) if vc_model else None,
        'mongo': mongo_status
    })

@app.route('/api/tts/generate', methods=['POST'])
def generate_tts():
    try:
        # Get text input
        text = request.form.get('text', '').strip()
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        if len(text) > 10000:
            return jsonify({'error': 'Text too long (max 10000 characters)'}), 400
        
        # Get parameters
        exaggeration = float(request.form.get('exaggeration', 0.5))
        temperature = float(request.form.get('temperature', 0.8))
        cfg_weight = float(request.form.get('cfg_weight', 0.5))
        min_p = float(request.form.get('min_p', 0.05))
        top_p = float(request.form.get('top_p', 1.0))
        repetition_penalty = float(request.form.get('repetition_penalty', 1.1))  # Reduced from 1.2 to 1.1 for longer audio
        seed = int(request.form.get('seed', 0))
        language = request.form.get('language', 'en')
        
        # Handle reference audio
        reference_audio_path = None
        if 'reference_audio' in request.files:
            file = request.files['reference_audio']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                reference_audio_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(reference_audio_path)
        
        # Set seed if specified
        if seed != 0:
            set_seed(seed)
        
        # Load model and generate
        model = load_tts_model()
        
        print(f"🎯 ChatterBox TTS Request:")
        print(f"📝 Text: {text[:50]}...")
        print(f"🌍 Language: {language}")
        print(f"🎭 Reference Audio: {'Yes' if reference_audio_path else 'No'}")
        print(f"🤖 Model: {type(model).__name__}")
        
        # Generate with ChatterBox TTS
        try:
            # Check if this is the multilingual version (needs language_id)
            is_multilingual = 'Multilingual' in str(type(model).__name__)
            
            if is_multilingual:
                print(f"🌍 Using Multilingual TTS with language_id: {language}")
                # Use language_id for multilingual version
                with torch.no_grad():
                    wav = model.generate(
                        text,
                        language_id=language,
                        audio_prompt_path=reference_audio_path,
                        exaggeration=exaggeration,
                        temperature=temperature,
                        cfg_weight=cfg_weight,
                        min_p=min_p,
                        top_p=top_p,
                        repetition_penalty=repetition_penalty,
                    )
                print(f"✅ Generated audio for language: {language}")
            else:
                print("🎤 Using Original TTS (English only - no language_id)")
                # Use original TTS without language_id
                with torch.no_grad():
                    wav = model.generate(
                        text,
                        audio_prompt_path=reference_audio_path,
                        exaggeration=exaggeration,
                        temperature=temperature,
                        cfg_weight=cfg_weight,
                        min_p=min_p,
                        top_p=top_p,
                        repetition_penalty=repetition_penalty,
                    )
                print("✅ Generated audio (English only)")
            
            if reference_audio_path:
                print(f"✅ Multilingual TTS with voice cloning successful!")
            else:
                print(f"✅ Multilingual TTS generation successful!")
                
        except Exception as e:
            print(f"❌ ResembleAI TTS generation failed: {e}")
            return jsonify({'error': f'TTS generation failed: {str(e)}'}), 500
        
        # Clean up temporary file
        if reference_audio_path and os.path.exists(reference_audio_path):
            os.remove(reference_audio_path)
        
        # Convert to WAV format
        audio_buffer = save_audio_to_wav(wav.squeeze(0), model.sr)
        
        return send_file(
            audio_buffer,
            mimetype='audio/wav',
            as_attachment=True,
            download_name='generated_speech.wav'
        )
        
    except Exception as e:
        print(f"TTS Generation error: {str(e)}")
        return jsonify({'error': f'Generation failed: {str(e)}'}), 500

@app.route('/api/vc/generate', methods=['POST'])
def generate_vc():
    try:
        # Check for source audio
        if 'source_audio' not in request.files:
            return jsonify({'error': 'Source audio is required'}), 400
        
        source_file = request.files['source_audio']
        if not source_file or not source_file.filename:
            return jsonify({'error': 'Source audio is required'}), 400
        
        if not allowed_file(source_file.filename):
            return jsonify({'error': 'Invalid audio file format'}), 400
        
        # Save source audio
        source_filename = secure_filename(source_file.filename)
        source_path = os.path.join(app.config['UPLOAD_FOLDER'], source_filename)
        source_file.save(source_path)
        
        # Handle target voice (optional)
        target_voice_path = None
        if 'target_voice' in request.files:
            target_file = request.files['target_voice']
            if target_file and target_file.filename and allowed_file(target_file.filename):
                target_filename = secure_filename(target_file.filename)
                target_voice_path = os.path.join(app.config['UPLOAD_FOLDER'], target_filename)
                target_file.save(target_voice_path)
        
        # Load model and generate
        model = load_vc_model()
        
        wav = model.generate(
            source_path,
            target_voice_path=target_voice_path,
        )
        
        # Clean up temporary files
        if os.path.exists(source_path):
            os.remove(source_path)
        if target_voice_path and os.path.exists(target_voice_path):
            os.remove(target_voice_path)
        
        # Convert to WAV format
        audio_buffer = save_audio_to_wav(wav.squeeze(0), model.sr)
        
        return send_file(
            audio_buffer,
            mimetype='audio/wav',
            as_attachment=True,
            download_name='converted_voice.wav'
        )
        
    except Exception as e:
        print(f"VC Generation error: {str(e)}")
        return jsonify({'error': f'Voice conversion failed: {str(e)}'}), 500

@app.route('/api/voices', methods=['GET'])
def list_voice_library():
    samples = read_voice_library()
    return jsonify({'samples': samples})

@app.route('/api/voices', methods=['POST'])
def upload_voice_sample():
    if 'voice' not in request.files:
        return jsonify({'error': 'Voice file is required (field name: voice)'}), 400

    file = request.files['voice']
    if not file or not file.filename:
        return jsonify({'error': 'Voice file is required'}), 400

    filename = secure_filename(file.filename)
    extension = Path(filename).suffix or '.wav'
    voice_id = uuid.uuid4().hex
    stored_name = f"{voice_id}{extension}"
    save_path = VOICE_LIB_DIR / stored_name

    try:
        file.save(save_path)
        sample = {
            'id': voice_id,
            'name': request.form.get('name') or filename or 'Voice Sample',
            'filename': stored_name,
            'size': save_path.stat().st_size,
            'type': file.mimetype or 'audio/wav',
            'createdAt': datetime.utcnow().isoformat() + 'Z',
            'url': f"/api/voices/{voice_id}/file"
        }

        samples = read_voice_library()
        samples.append(sample)
        write_voice_library(samples)

        return jsonify(sample), 201
    except Exception as exc:
        print(f"❌ Failed to save voice sample: {exc}")
        return jsonify({'error': f'Could not save voice sample: {exc}'}), 500

@app.route('/api/voices/<voice_id>/file', methods=['GET'])
def get_voice_sample_file(voice_id):
    samples = read_voice_library()
    sample = next((s for s in samples if s.get('id') == voice_id), None)
    if not sample:
        return jsonify({'error': 'Voice sample not found'}), 404

    file_path = VOICE_LIB_DIR / sample.get('filename', '')
    if not file_path.exists():
        return jsonify({'error': 'Voice file missing on server'}), 404

    return send_file(
        file_path,
        mimetype=sample.get('type') or 'audio/wav',
        as_attachment=False,
        download_name=sample.get('name') or 'voice-sample.wav'
    )

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large (max 50MB)'}), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print(f"Starting ResembleAI Chatterbox Multilingual TTS API server on device: {DEVICE}")
    print("Loading models...")
    
    # Pre-load models for faster response times
    try:
        load_tts_model()
        load_vc_model()
        get_mongo_db()
        print("All models loaded successfully!")
    except Exception as e:
        print(f"Warning: Could not pre-load models: {e}")
        print("Models will be loaded on first request.")
    
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)), debug=True)
