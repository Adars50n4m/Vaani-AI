import React, { useMemo, useState } from 'react'
import FileUpload from './ui/FileUpload'
import Button from './ui/Button'
import { useAudioSamples } from '../context/AudioSampleContext'

import usePersistentState from '../hooks/usePersistentState'

const targetLanguages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' }
]

const DubbingPanel = () => {
  const [sourceAudio, setSourceAudio] = useState(null)
  const [sourceVideo, setSourceVideo] = useState(null)
  const [targetLanguage, setTargetLanguage] = usePersistentState('vaani_dub_language', 'en')
  const [lipSync, setLipSync] = usePersistentState('vaani_dub_lipsync', true)
  const [status, setStatus] = useState('Idle - waiting for media upload')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedSampleId, setSelectedSampleId] = useState(null)
  const { samples, getSampleFile, isHydrated } = useAudioSamples()

  const selectedSampleName = useMemo(() => {
    if (!selectedSampleId) return null
    const sample = samples.find((item) => item.id === selectedSampleId)
    return sample?.name || null
  }, [selectedSampleId, samples])

  const handleSampleSelect = (sampleId) => {
    setSelectedSampleId(sampleId)
    setStatus('Voice model selected from library')
  }

  const handleDub = async () => {
    if (!sourceAudio && !sourceVideo) {
      alert('Upload an audio or video source first')
      return
    }
    setIsProcessing(true)
    setStatus('Preparing media locally (offline macOS flow)...')
    try {
      // Placeholder for actual backend call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStatus(`Dubbed to ${targetLanguage.toUpperCase()}${lipSync ? ' with lip-sync' : ''}. Output ready for download.`)
    } catch (error) {
      setStatus('Failed to dub media')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLipSyncToggle = () => {
    setLipSync((prev) => !prev)
  }

  const renderLibrary = () => {
    if (!isHydrated || samples.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 text-sm">Saved library clips will appear here for instant reuse.</p>
      )
    }

    return (
      <div className="flex flex-wrap gap-2">
        {samples.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => handleSampleSelect(sample.id)}
            className={`px-4 py-1.5 rounded-full border text-xs uppercase tracking-widest transition ${selectedSampleId === sample.id
              ? 'border-emerald-300 text-emerald-700 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-300/10'
              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-black hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            {sample.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <FileUpload
          label="Source Audio"
          accept="audio/*"
          onChange={setSourceAudio}
          helperText="Upload narration or dialogue track"
        />

        <FileUpload
          label="Source Video (Optional)"
          accept="video/*"
          onChange={setSourceVideo}
          helperText="Add mp4/mov to enable lip-sync alignment"
        />

        <div className="space-y-2">
          <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Target Language</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="input-field w-full bg-gray-50 dark:bg-black"
          >
            {targetLanguages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-white dark:bg-black">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black p-4">
          <div>
            <p className="text-gray-900 dark:text-white font-semibold">Lip-Sync Alignment</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Locks dubbed speech to on-screen mouth shapes</p>
          </div>
          <button
            type="button"
            onClick={handleLipSyncToggle}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${lipSync ? 'bg-polo-lime' : 'bg-gray-200 dark:bg-gray-700'
              }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${lipSync ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Voice Model Library</p>
          {renderLibrary()}
          {selectedSampleName && (
            <p className="text-emerald-600 dark:text-emerald-400 text-xs">Using {selectedSampleName} for dubbing voice</p>
          )}
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleDub}
          disabled={isProcessing}
          loading={isProcessing}
        >
          {isProcessing ? 'Generating Dub...' : 'Generate Dub'}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="polo-card p-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-gray-900 dark:text-white text-lg font-medium">{status}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              All processing remains offline on your MacBook. When a backend is available, connect it for cloud scale.
            </p>
          </div>
        </div>

        {sourceVideo && (
          <div className="polo-card p-6">
            <p className="text-gray-600 dark:text-gray-300 text-sm">Video uploaded · lip-sync {lipSync ? 'enabled' : 'disabled'}</p>
          </div>
        )}

        {sourceAudio && !sourceVideo && (
          <div className="polo-card p-6">
            <p className="text-gray-600 dark:text-gray-300 text-sm">Audio-only dubbing pipeline selected.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DubbingPanel
