import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AudioUpload from './AudioUpload'
import AudioPlayer from './AudioPlayer'
import { generateTTS } from '../services/api'

const TTSPanel = () => {
  const [text, setText] = useState("Now let's make my mum's favourite. So three mars bars into the pan. Then we add the tuna and just stir for a bit, just let the chocolate and fish infuse.")
  const [referenceAudio, setReferenceAudio] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Advanced settings
  const [settings, setSettings] = useState({
    exaggeration: 0.5,
    temperature: 0.8,
    cfgWeight: 0.5,
    minP: 0.05,
    topP: 1.0,
    repetitionPenalty: 1.2,
    seed: 0,
    language: 'en'
  })

  // Language options
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
  ]

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to synthesize')
      return
    }

    setIsGenerating(true)
    try {
      const audioBlob = await generateTTS({
        text,
        referenceAudio,
        ...settings
      })
      setGeneratedAudio(audioBlob)
      toast.success('Audio generated successfully!')
    } catch (error) {
      toast.error('Failed to generate audio: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          Text to Speech
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-white/80 mb-2 font-medium">
              Text to Synthesize
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input-field w-full h-32 resize-none"
              placeholder="Enter your text here (max 300 characters)..."
              maxLength={300}
            />
            <div className="text-right text-white/60 text-sm mt-1">
              {text.length}/300
            </div>
          </div>

          <div>
            <label className="block text-white/80 mb-2 font-medium">
              Language
            </label>
            <div className="relative">
              <select
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value})}
                className="input-field w-full appearance-none bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20 cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-gray-900 text-white py-2">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Selected: {languages.find(l => l.code === settings.language)?.flag} {languages.find(l => l.code === settings.language)?.name}
            </p>
          </div>

          <div>
            <label className="block text-white/80 mb-2 font-medium">
              Reference Voice (Optional)
            </label>
            <AudioUpload
              onFileSelect={setReferenceAudio}
              accept="audio/*"
              text="Upload reference audio or record"
            />
            <div className="mt-2 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
              <p className="text-green-300 text-sm flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Voice cloning enabled! Upload reference audio to clone any voice.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-white/80 mb-2 font-medium">
              Exaggeration: {settings.exaggeration}
            </label>
            <input
              type="range"
              min="0.25"
              max="2"
              step="0.05"
              value={settings.exaggeration}
              onChange={(e) => setSettings({...settings, exaggeration: parseFloat(e.target.value)})}
              className="w-full h-2 slider"
            />
            <div className="flex justify-between text-gray-400 text-sm mt-1">
              <span>Neutral (0.5)</span>
              <span>Extreme (2.0)</span>
            </div>
          </div>

          <motion.button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn-secondary w-full flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </motion.button>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-white/20"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-1 text-sm">Temperature: {settings.temperature}</label>
                  <input
                    type="range"
                    min="0.05"
                    max="5"
                    step="0.05"
                    value={settings.temperature}
                    onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                    className="w-full h-2 slider"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-1 text-sm">CFG Weight: {settings.cfgWeight}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.cfgWeight}
                    onChange={(e) => setSettings({...settings, cfgWeight: parseFloat(e.target.value)})}
                    className="w-full h-2 slider"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-1 text-sm">Min P: {settings.minP}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.minP}
                    onChange={(e) => setSettings({...settings, minP: parseFloat(e.target.value)})}
                    className="w-full h-2 slider"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-1 text-sm">Top P: {settings.topP}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.topP}
                    onChange={(e) => setSettings({...settings, topP: parseFloat(e.target.value)})}
                    className="w-full h-2 slider"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-1 text-sm">Repetition Penalty: {settings.repetitionPenalty}</label>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={settings.repetitionPenalty}
                    onChange={(e) => setSettings({...settings, repetitionPenalty: parseFloat(e.target.value)})}
                    className="w-full h-2 slider"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-1 text-sm">Seed: {settings.seed}</label>
                  <input
                    type="number"
                    value={settings.seed}
                    onChange={(e) => setSettings({...settings, seed: parseInt(e.target.value)})}
                    className="input-field w-full"
                    placeholder="0 for random"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <motion.button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary w-full flex items-center justify-center"
            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
            whileTap={{ scale: isGenerating ? 1 : 0.98 }}
          >
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : (
              <span className="mr-2">▶</span>
            )}
            {isGenerating ? 'Generating Speech...' : 'Generate Speech'}
          </motion.button>

          <div className="mt-4 p-3 bg-purple-900/30 border border-purple-700/50 rounded-lg">
            <p className="text-purple-300 text-sm flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
              Using Vaani TTS with real voice cloning and advanced AI models
            </p>
          </div>
        </div>
      </motion.div>

      {/* Output Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Generated Audio</h2>
        
        {generatedAudio ? (
          <AudioPlayer audioBlob={generatedAudio} />
        ) : (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-white/30 rounded-xl">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-white/60 text-2xl">▶</span>
              </motion.div>
              <p className="text-white/60">Generated audio will appear here</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default TTSPanel