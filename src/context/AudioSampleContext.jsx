import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'vaani_audio_samples_v1'
const API_BASE = '/api/voices'

const AudioSampleContext = createContext(null)

const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const dataUrlToFile = (dataUrl, fileName = 'sample.wav', type) => {
  const arr = dataUrl.split(',')
  const mimeMatch = arr[0]?.match(/:(.*?);/)
  const mime = type || mimeMatch?.[1] || 'audio/wav'
  const bstr = atob(arr[1] || '')
  const n = bstr.length
  const u8arr = new Uint8Array(n)
  for (let i = 0; i < n; i += 1) {
    u8arr[i] = bstr.charCodeAt(i)
  }
  return new File([u8arr], fileName, { type: mime })
}

const fetchUrlToFile = async (url, fileName = 'sample.wav', type = 'audio/wav') => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch voice sample')
  const blob = await res.blob()
  return new File([blob], fileName, { type: blob.type || type })
}

const readStoredSamples = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
    if (parsed?.samples && Array.isArray(parsed.samples)) {
      return parsed.samples
    }
    return []
  } catch (error) {
    console.warn('Failed to parse stored samples', error)
    return []
  }
}

const persistSamples = (samples) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(samples))
  } catch (error) {
    console.warn('Failed to persist samples', error)
  }
}

export const AudioSampleProvider = ({ children }) => {
  const [samples, setSamples] = useState(() => readStoredSamples())
  const [isHydrated, setIsHydrated] = useState(false)
  const [serverReady, setServerReady] = useState(false)

  useEffect(() => {
    setSamples(readStoredSamples())
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    const syncFromServer = async () => {
      try {
        const res = await fetch(API_BASE)
        if (!res.ok) throw new Error('Server voice library unavailable')
        const payload = await res.json()
        if (payload?.samples) {
          setSamples((prev) => {
            const map = new Map()
            payload.samples.forEach((sample) => {
              map.set(sample.id, sample)
            })
            prev.forEach((sample) => {
              if (!map.has(sample.id)) {
                map.set(sample.id, sample)
              } else if (sample.dataUrl && !map.get(sample.id).dataUrl) {
                map.set(sample.id, { ...map.get(sample.id), dataUrl: sample.dataUrl })
              }
            })
            return Array.from(map.values())
          })
        }
        setServerReady(true)
      } catch (error) {
        console.warn('Voice library server sync failed, using local storage only', error)
        setServerReady(true)
      }
    }
    syncFromServer()
  }, [])

  useEffect(() => {
    if (isHydrated) {
      persistSamples(samples)
    }
  }, [samples, isHydrated])

  const addSample = useCallback(async (file, customName) => {
    if (!file) return null
    const fallbackSample = {
      id: (crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`),
      name: customName?.trim() || file.name || 'Voice Sample',
      size: file.size,
      type: file.type,
      createdAt: new Date().toISOString(),
    }

    let serverSample = null
    if (serverReady) {
      try {
        const formData = new FormData()
        formData.append('voice', file)
        formData.append('name', fallbackSample.name)
        const res = await fetch(API_BASE, { method: 'POST', body: formData })
        if (res.ok) {
          serverSample = await res.json()
        }
      } catch (error) {
        console.warn('Could not persist voice to server, keeping local copy', error)
      }
    }

    let dataUrl = null
    try {
      dataUrl = await fileToDataUrl(file)
    } catch (error) {
      console.warn('Could not cache voice data URL', error)
    }

    const sample = {
      ...(serverSample || fallbackSample),
      dataUrl: dataUrl || null,
      url: serverSample?.url,
    }

    setSamples((prev) => [...prev, sample])
    return sample
  }, [serverReady])

  const renameSample = useCallback((id, name) => {
    setSamples((prev) => prev.map((sample) => (
      sample.id === id ? { ...sample, name: name.trim() || sample.name } : sample
    )))
  }, [])

  const deleteSample = useCallback((id) => {
    setSamples((prev) => prev.filter((sample) => sample.id !== id))
  }, [])

  const getSampleFile = useCallback(async (id) => {
    const sample = samples.find((item) => item.id === id)
    if (!sample) return null
    if (sample.dataUrl) {
      return dataUrlToFile(sample.dataUrl, sample.name, sample.type)
    }
    if (sample.url) {
      return fetchUrlToFile(sample.url, sample.name, sample.type)
    }
    return null
  }, [samples])

  const contextValue = {
    samples,
    addSample,
    renameSample,
    deleteSample,
    getSampleFile,
    isHydrated,
  }

  return (
    <AudioSampleContext.Provider value={contextValue}>
      {children}
    </AudioSampleContext.Provider>
  )
}

export const useAudioSamples = () => {
  const context = useContext(AudioSampleContext)
  if (!context) {
    throw new Error('useAudioSamples must be used within an AudioSampleProvider')
  }
  return context
}
