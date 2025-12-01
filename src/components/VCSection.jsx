import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import Button from './ui/Button'
import FileUpload from './ui/FileUpload'
import AudioPlayer from './ui/AudioPlayer'

import { useAudioSamples } from '../context/AudioSampleContext'
import usePersistentState from '../hooks/usePersistentState'

const VCSection = () => {
  const [sourceAudio, setSourceAudio] = useState(null)
  const [targetAudio, setTargetAudio] = useState(null)
  const [isConverting, setIsConverting] = useState(false)
  const [convertedAudio, setConvertedAudio] = useState(null)
  const { samples, getSampleFile, isHydrated, addSample } = useAudioSamples()
  const [savingVoice, setSavingVoice] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const convertVoice = async () => {
    if (!sourceAudio) {
      alert('Please upload source audio')
      return
    }

    setIsConverting(true)
    try {
      const formData = new FormData()
      formData.append('source_audio', sourceAudio)
      if (targetAudio) {
        formData.append('target_voice', targetAudio)
      }

      const response = await fetch('/api/vc/generate', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        setConvertedAudio(audioUrl)
        alert('🎉 Voice conversion completed!')
      } else {
        const error = await response.text()
        alert('❌ Voice conversion failed: ' + error)
      }
    } catch (error) {
      alert('❌ Error: ' + error.message)
    } finally {
      setIsConverting(false)
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
    setTargetAudio(file)
    setStatusMessage(`Using saved voice: ${file.name}`)
  }

  const handleTargetUpload = (file) => {
    setTargetAudio(file)
    if (file) {
      setStatusMessage(`Loaded target voice: ${file.name}`)
    }
  }

  const saveTargetToLibrary = async () => {
    if (!targetAudio) return
    setSavingVoice(true)
    try {
      const saved = await addSample(targetAudio)
      setStatusMessage(`Saved ${saved?.name || targetAudio.name} to library`)
    } catch (error) {
      alert('Could not save voice to library')
    } finally {
      setSavingVoice(false)
    }
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Input Panel */}
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full">
          <CardHeader>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CardTitle>Voice to Voice Conversion</CardTitle>
            </motion.div>
          </CardHeader>

          <CardContent>
            <FileUpload
              label="Source Audio (Required)"
              accept="audio/*"
              onChange={setSourceAudio}
              value={sourceAudio}
              helperText="Upload the audio you want to convert"
            />

            <FileUpload
              label="Target Voice (Optional)"
              accept="audio/*"
              onChange={handleTargetUpload}
              value={targetAudio}
              helperText="Upload target voice sample for conversion"
            />

            {targetAudio && (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Loaded target: {targetAudio.name}</p>
                <Button size="sm" variant="secondary" onClick={saveTargetToLibrary} loading={savingVoice}>
                  Save to Voice Library
                </Button>
              </div>
            )}

            {isHydrated && samples.length > 0 && (
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Voice Model Library</p>
                <div className="flex flex-wrap gap-2">
                  {samples.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleUseLibrarySample(sample.id)}
                      className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {statusMessage && (
              <p className="text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-widest">{statusMessage}</p>
            )}

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={convertVoice}
                loading={isConverting}
                disabled={!sourceAudio}
                className="w-full"
                size="lg"
              >
                {isConverting ? 'Converting Voice...' : 'Convert Voice'}
              </Button>
            </motion.div>

          </CardContent>
        </Card>
      </motion.div>

      {/* Output Panel */}
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full">
          <CardHeader>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <CardTitle>Converted Audio</CardTitle>
            </motion.div>
          </CardHeader>

          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <AudioPlayer src={convertedAudio} title="Converted Voice" />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default VCSection
