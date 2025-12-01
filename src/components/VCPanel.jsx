import React, { useState } from 'react'
import { motion } from 'framer-motion'

import toast from 'react-hot-toast'
import AudioUpload from './AudioUpload'
import AudioPlayer from './AudioPlayer'
import { generateVC } from '../services/api'

const VCPanel = () => {
  const [sourceAudio, setSourceAudio] = useState(null)
  const [targetVoice, setTargetVoice] = useState(null)
  const [isConverting, setIsConverting] = useState(false)
  const [convertedAudio, setConvertedAudio] = useState(null)

  const handleConvert = async () => {
    if (!sourceAudio) {
      toast.error('Please upload source audio to convert')
      return
    }

    setIsConverting(true)
    try {
      const audioBlob = await generateVC({
        sourceAudio,
        targetVoice
      })
      setConvertedAudio(audioBlob)
      toast.success('Voice conversion completed!')
    } catch (error) {
      toast.error('Failed to convert voice: ' + error.message)
    } finally {
      setIsConverting(false)
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
          Voice Conversion
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-white/80 mb-2 font-medium">
              Source Audio *
            </label>
            <AudioUpload
              onFileSelect={setSourceAudio}
              accept="audio/*"
              icon={Upload}
              text="Upload audio to convert or record"
            />
            {sourceAudio && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-white/10 rounded-lg"
              >
                <p className="text-white/80 text-sm">
                  ✓ Source audio uploaded: {sourceAudio.name}
                </p>
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-white/80 mb-2 font-medium">
              Target Voice (Optional)
            </label>
            <AudioUpload
              onFileSelect={setTargetVoice}
              accept="audio/*"
              icon={Upload}
              text="Upload target voice or use default"
            />
            {targetVoice && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-white/10 rounded-lg"
              >
                <p className="text-white/80 text-sm">
                  ✓ Target voice uploaded: {targetVoice.name}
                </p>
              </motion.div>
            )}
            <p className="text-white/60 text-sm mt-2">
              If no target voice is provided, the default voice will be used
            </p>
          </div>

          <motion.button
            onClick={handleConvert}
            disabled={isConverting || !sourceAudio}
            className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-medium transition-all duration-300 ${
              isConverting || !sourceAudio
                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                : 'btn-primary'
            }`}
            whileHover={{ scale: isConverting || !sourceAudio ? 1 : 1.02 }}
            whileTap={{ scale: isConverting || !sourceAudio ? 1 : 0.98 }}
          >
            {isConverting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : (
              <span className="mr-2">🔄</span>
            )}
            {isConverting ? 'Converting Voice...' : 'Convert Voice'}
          </motion.button>
        </div>
      </motion.div>

      {/* Output Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Converted Audio</h2>
        
        {convertedAudio ? (
          <AudioPlayer audioBlob={convertedAudio} />
        ) : (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-white/30 rounded-xl">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
              </motion.div>
              <p className="text-white/60">Converted audio will appear here</p>
            </div>
          </div>
        )}

        {/* Preview Section */}
        <div className="mt-6 space-y-4">
          {sourceAudio && (
            <div>
              <h3 className="text-white/80 font-medium mb-2">Source Audio Preview</h3>
              <AudioPlayer audioBlob={sourceAudio} />
            </div>
          )}
          
          {targetVoice && (
            <div>
              <h3 className="text-white/80 font-medium mb-2">Target Voice Preview</h3>
              <AudioPlayer audioBlob={targetVoice} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default VCPanel