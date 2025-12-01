import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'


const AudioUpload = ({ onFileSelect, accept = "audio/*", icon: Icon = Upload, text = "Upload audio file" }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    multiple: false
  })

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' })
        setSelectedFile(file)
        onFileSelect(file)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setMediaRecorder(null)
      setIsRecording(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    onFileSelect(null)
  }

  return (
    <div className="space-y-3">
      {!selectedFile ? (
        <motion.div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-primary-400 bg-primary-500/10'
              : 'border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input {...getInputProps()} />
          <div className="w-8 h-8 bg-white/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <span className="text-white/60 text-xs font-bold">FILE</span>
          </div>
          <p className="text-white/80 font-medium mb-1">
            {isDragActive ? 'Drop the audio file here' : text}
          </p>
          <p className="text-white/60 text-sm">
            Drag & drop or click to browse
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="w-5 h-5 bg-green-400 rounded mr-3"></div>
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-white/60 text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <motion.button
            onClick={clearFile}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-white/60 text-sm">×</span>
          </motion.button>
        </motion.div>
      )}

      <div className="flex justify-center">
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={`w-4 h-4 bg-white rounded-full ${isRecording ? 'animate-pulse' : ''}`}></div>
          <span>{isRecording ? 'Stop Recording' : 'Record Audio'}</span>
        </motion.button>
      </div>
    </div>
  )
}

export default AudioUpload