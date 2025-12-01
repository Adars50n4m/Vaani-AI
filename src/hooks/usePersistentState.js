import { useEffect, useState } from 'react'

// Simple localStorage-backed state; falls back to in-memory when storage is unavailable.
const usePersistentState = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null || raw === undefined) return defaultValue
      return JSON.parse(raw)
    } catch (error) {
      console.warn(`Failed to read persisted state for ${key}`, error)
      return defaultValue
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Failed to persist state for ${key}`, error)
    }
  }, [key, value])

  return [value, setValue]
}

export default usePersistentState
