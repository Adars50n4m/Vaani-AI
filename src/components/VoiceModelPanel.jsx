import React, { useState } from 'react'
import FileUpload from './ui/FileUpload'
import Button from './ui/Button'
import { useAudioSamples } from '../context/AudioSampleContext'

const formatBytes = (bytes = 0) => {
  if (!bytes) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  const order = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / (1024 ** order)
  return `${value.toFixed(value >= 10 || order === 0 ? 0 : 1)} ${units[order]}`
}

const VoiceModelPanel = ({ panelContent }) => {
  const { samples, addSample, renameSample, deleteSample } = useAudioSamples()
  const [uploadKey, setUploadKey] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const handleSampleUpload = async (file) => {
    if (!file) return
    setIsUploading(true)
    try {
      await addSample(file)
      setUploadKey((key) => key + 1)
    } finally {
      setIsUploading(false)
    }
  }

  const startEditing = (sample) => {
    setEditingId(sample.id)
    setEditingName(sample.name)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingName('')
  }

  const commitRename = () => {
    if (!editingId) return
    renameSample(editingId, editingName)
    cancelEditing()
  }

  return (
    <div className="space-y-6">
      <div className="polo-card p-6 border border-gray-200 dark:border-gray-700 rounded-[32px] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400">Sample Upload</p>
            <p className="text-gray-900 dark:text-white text-lg font-semibold mt-1">Build Your Voice Library</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Samples are saved locally and on the server for reuse after restart.</p>
          </div>
          {isUploading && (
            <span className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Saving...</span>
          )}
        </div>
        <FileUpload
          key={uploadKey}
          label="Add voice reference"
          accept="audio/*"
          onChange={handleSampleUpload}
          helperText="Drop or select WAV/MP3/M4A clips to store in the library"
        />
      </div>

      <div className="polo-card p-6 border border-gray-200 dark:border-gray-700 rounded-[32px] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400">Saved Samples</p>
            <p className="text-gray-900 dark:text-white text-lg font-semibold mt-1">
              {samples.length ? `${samples.length} model${samples.length > 1 ? 's' : ''} ready` : 'No models yet'}
            </p>
          </div>
        </div>

        {samples.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black p-4 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Upload a voice clip to see it here. Everything stays synced even after refresh.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto menu-scroll pr-1">
            {samples.map((sample) => (
              <div
                key={sample.id}
                className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-gray-50 dark:bg-black space-y-3"
              >
                {editingId === sample.id ? (
                  <div className="space-y-2">
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="input-field w-full"
                      placeholder="Sample name"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={commitRename}>
                        Save
                      </Button>
                      <Button size="sm" variant="secondary" onClick={cancelEditing}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <p className="text-gray-900 dark:text-white font-semibold">{sample.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatBytes(sample.size)} • {new Date(sample.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <audio controls src={sample.dataUrl || sample.url} className="w-full" />

                <div className="flex flex-wrap gap-2">
                  {editingId !== sample.id && (
                    <Button size="sm" variant="secondary" onClick={() => startEditing(sample)}>
                      Rename
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteSample(sample.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VoiceModelPanel
