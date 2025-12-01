import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Textarea } from './ui/Input'
import Button from './ui/Button'
import Slider from './ui/Slider'
import FileUpload from './ui/FileUpload'
import AudioPlayer from './ui/AudioPlayer'
import Collapsible from './ui/Collapsible'

import { useAudioSamples } from '../context/AudioSampleContext'
import usePersistentState from '../hooks/usePersistentState'

const TTSSection = () => {
  // Default text
  const [text, setText] = usePersistentState('vaani_tts_text', "Now let's make my mum's favourite. So three mars bars into the pan. Then we add the tuna and just stir for a bit, just let the chocolate and fish infuse. A sprinkle of olive oil and some tomato ketchup. Now smell that. Oh boy this is going to be incredible.")
  const [referenceAudio, setReferenceAudio] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState(null)
  const [progress, setProgress] = useState(0)

  // TTS Settings
  const [language, setLanguage] = usePersistentState('vaani_tts_language', 'en')
  const [exaggeration, setExaggeration] = usePersistentState('vaani_tts_exaggeration', 0.5)
  const [cfgWeight, setCfgWeight] = usePersistentState('vaani_tts_cfg', 0.5)
  const [seedNum, setSeedNum] = usePersistentState('vaani_tts_seed', 0)
  const [temperature, setTemperature] = usePersistentState('vaani_tts_temperature', 0.8)
  const [minP, setMinP] = usePersistentState('vaani_tts_min_p', 0.05)
  const [topP, setTopP] = usePersistentState('vaani_tts_top_p', 1.0)
  const [repetitionPenalty, setRepetitionPenalty] = usePersistentState('vaani_tts_repetition', 1.1)  // Reduced for longer audio generation
  const { samples, getSampleFile, isHydrated, addSample } = useAudioSamples()
  const [libraryMessage, setLibraryMessage] = useState('')
  const [savingVoice, setSavingVoice] = useState(false)

  // Language options for ResembleAI Multilingual TTS
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ]

  const generateTTS = async () => {
    if (!text.trim()) {
      alert('Please enter some text')
      return
    }

    if (text.length > 10000) {
      alert('Text too long (max 10000 characters)')
      return
    }

    setIsGenerating(true)
    setProgress(8)
    try {
      const formData = new FormData()
      formData.append('text', text)
      formData.append('exaggeration', exaggeration.toString())
      formData.append('temperature', temperature.toString())
      formData.append('cfg_weight', cfgWeight.toString())
      formData.append('min_p', minP.toString())
      formData.append('top_p', topP.toString())
      formData.append('repetition_penalty', repetitionPenalty.toString())
      formData.append('seed', seedNum.toString())
      formData.append('language', language)

      if (referenceAudio) {
        formData.append('reference_audio', referenceAudio)
        console.log('🎭 Reference audio attached:', referenceAudio.name, referenceAudio.size, 'bytes')
      } else {
        console.log('📝 No reference audio provided - using standard voice')
      }

      console.log('🚀 Sending Vaani TTS request...')
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        setGeneratedAudio(audioUrl)

        if (referenceAudio) {
          alert('🎉 Vaani TTS with voice cloning successful!')
        } else {
          alert('🎉 Vaani TTS generated successfully!')
        }
      } else {
        const error = await response.text()
        alert('❌ TTS generation failed: ' + error)
      }
    } catch (error) {
      alert('❌ Error: ' + error.message)
    } finally {
      setProgress(100)
      setIsGenerating(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const handleUseLibrarySample = async (sampleId) => {
    const file = await getSampleFile(sampleId)
    if (!file) return
    setReferenceAudio(file)
    setLibraryMessage(`Using saved sample: ${file.name}`)
    setTimeout(() => setLibraryMessage(''), 4000)
  }

  const handleReferenceUpload = (file) => {
    setReferenceAudio(file)
    if (file) {
      setLibraryMessage(`Voice loaded: ${file.name}`)
    }
  }

  const saveReferenceToLibrary = async () => {
    if (!referenceAudio) return
    setSavingVoice(true)
    try {
      const saved = await addSample(referenceAudio)
      setLibraryMessage(`Saved ${saved?.name || referenceAudio.name} to library`)
      setTimeout(() => setLibraryMessage(''), 4000)
    } catch (error) {
      alert('Could not save voice to library')
    } finally {
      setSavingVoice(false)
    }
  }

  useEffect(() => {
    let intervalId
    let resetTimeout

    if (isGenerating) {
      intervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          const increment = 5 + Math.random() * 7
          return Math.min(prev + increment, 90)
        })
      }, 650)
    } else if (progress === 100) {
      resetTimeout = setTimeout(() => setProgress(0), 500)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (resetTimeout) clearTimeout(resetTimeout)
    }
  }, [isGenerating, progress])

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Box 1: Text Input & Language */}
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Vaani TTS</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            <Textarea
              label="Text to synthesize (max chars 10000)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              maxLength={10000}
              helperText={`${text.length}/10000 characters`}
              className="flex-1 min-h-[120px]"
            />

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field w-full appearance-none bg-gray-50 dark:bg-black border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-polo-lime focus:ring-polo-lime/20 cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-white dark:bg-black text-gray-900 dark:text-white py-2">
                    {lang.name}
                  </option>
                ))}
              </select>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Selected: {languages.find(l => l.code === language)?.name}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Box 2: Voice Upload & Library */}
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Voice Cloning</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            <div className="space-y-3">
              <FileUpload
                label="Upload voice (optional, for cloning)"
                accept="audio/*"
                onChange={handleReferenceUpload}
                value={referenceAudio}
                helperText="Add a short clip to mimic this voice for the next TTS run"
              />
              {referenceAudio && (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Loaded: {referenceAudio.name}</p>
                  <Button size="sm" variant="secondary" onClick={saveReferenceToLibrary} loading={savingVoice}>
                    Save to Voice Library
                  </Button>
                </div>
              )}
            </div>

            {isHydrated && samples.length > 0 && (
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Or pick from Voice Model Library</p>
                <div className="flex flex-wrap gap-2">
                  {samples.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleUseLibrarySample(sample.id)}
                      className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
                {libraryMessage && (
                  <p className="text-emerald-300 text-xs uppercase tracking-[0.2em]">{libraryMessage}</p>
                )}
              </div>
            )}

            <div className="mt-auto space-y-3">
              {referenceAudio ? (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                    ✅ Voice cloning enabled: {referenceAudio.name}
                  </p>
                  <p className="text-green-600 dark:text-green-500 text-xs mt-1">
                    Vaani TTS with voice cloning
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">
                    Vaani Multilingual TTS
                  </p>
                  <p className="text-blue-600 dark:text-blue-500 text-xs mt-1">
                    Supports 16+ languages including Hindi
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Box 3: Settings & Generation */}
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            <Slider
              label="Exaggeration"
              value={exaggeration}
              onChange={setExaggeration}
              min={0.25}
              max={2}
              step={0.05}
              helperText="Neutral = 0.5, extreme values can be unstable"
            />

            <Slider
              label="CFG/Pace"
              value={cfgWeight}
              onChange={setCfgWeight}
              min={0}
              max={1}
              step={0.05}
            />

            <Collapsible title="More Options">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                    Random Seed (0 for random)
                  </label>
                  <input
                    type="number"
                    value={seedNum}
                    onChange={(e) => setSeedNum(parseInt(e.target.value) || 0)}
                    className="input-field w-full"
                    placeholder="0"
                  />
                </div>

                <Slider
                  label="Temperature"
                  value={temperature}
                  onChange={setTemperature}
                  min={0.05}
                  max={5}
                  step={0.05}
                />

                <Slider
                  label="Min P"
                  value={minP}
                  onChange={setMinP}
                  min={0}
                  max={1}
                  step={0.01}
                  helperText="Newer Sampler. Recommend 0.02 > 0.1"
                />

                <Slider
                  label="Top P"
                  value={topP}
                  onChange={setTopP}
                  min={0}
                  max={1}
                  step={0.01}
                  helperText="Original Sampler. 1.0 Disables"
                />

                <Slider
                  label="Repetition Penalty"
                  value={repetitionPenalty}
                  onChange={setRepetitionPenalty}
                  min={1}
                  max={2}
                  step={0.1}
                />
              </div>
            </Collapsible>

            <div className="mt-auto pt-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={generateTTS}
                  loading={isGenerating}
                  disabled={!text.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? 'Generating Speech...' : 'Generate Speech'}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Box 4: Output Panel */}
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Generated Audio</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <AudioPlayer
                src={generatedAudio}
                title="Generated Speech"
                isGenerating={isGenerating}
                progress={progress}
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default TTSSection
