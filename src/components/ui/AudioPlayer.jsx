import React, { useState, useRef, useEffect } from 'react'
import Button from './Button'

const AudioPlayer = ({ src, title = "Generated Audio", isGenerating = false, progress = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)
  const safeProgress = Math.max(0, Math.min(100, progress || 0))
  const showProgress = isGenerating || safeProgress > 0

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [src])

  const togglePlay = () => {
    const audio = audioRef.current
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    audio.currentTime = percent * duration
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const downloadAudio = () => {
    const a = document.createElement('a')
    a.href = src
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.wav`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (!src) {
    return (
      <div className="polo-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-transparent to-gray-50 dark:from-white/5 dark:to-white/5 pointer-events-none" />
        <div className="w-16 h-16 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-gray-700">
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">AUDIO</span>
        </div>
        {showProgress ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
              <span className="w-2 h-2 rounded-full bg-polo-lime animate-ping" />
              <span>{isGenerating ? 'Generating audio...' : 'Finalizing audio...'}</span>
            </div>
            <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-white/5 to-purple-500/10 animate-pulse"
              />
              <div
                className="relative h-full bg-polo-lime rounded-full transition-all duration-300"
                style={{ width: `${Math.max(8, safeProgress)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{Math.round(safeProgress)}%</p>
            <p className="text-gray-500 dark:text-gray-400">Generated audio will appear here</p>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Generated audio will appear here</p>
        )}
      </div>
    )
  }

  return (
    <div className="polo-card p-6 space-y-4">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          {showProgress && (
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full bg-polo-lime animate-ping" />
              <span>{isGenerating ? 'Rendering' : 'Ready'}</span>
              <span className="text-gray-400 dark:text-gray-600">{Math.round(safeProgress)}%</span>
            </div>
          )}
        </div>

        {showProgress && (
          <div className="space-y-1">
            <div className="relative h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/15 via-white/10 to-purple-500/15 animate-pulse" />
              <div
                className="relative h-full bg-polo-lime rounded-full transition-all duration-300"
                style={{ width: `${Math.max(10, safeProgress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-polo-lime rounded-full transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full p-0"
          >
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={downloadAudio}
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer
