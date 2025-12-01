import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

const FileUpload = ({
  label,
  accept = '*/*',
  onChange,
  helperText,
  className = '',
  value,
  ...props
}) => {
  const fileInputRef = useRef(null)
  const [internalFileName, setInternalFileName] = useState('')

  const fileName = value ? value.name : internalFileName

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setInternalFileName(file.name)
      onChange && onChange(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-gray-700 dark:text-gray-300 font-medium">
          {label}
        </label>
      )}

      <div className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          {...props}
        />

        <div className="space-y-3">
          <div className="w-12 h-12 bg-gray-50 dark:bg-black rounded-full flex items-center justify-center mx-auto border border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">FILE</span>
          </div>

          {fileName ? (
            <div>
              <p className="text-gray-900 dark:text-white font-medium">{fileName}</p>
              <p className="text-green-600 dark:text-green-400 text-sm">File selected</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 dark:text-gray-300">Drop files here or click to browse</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">Supports audio files</p>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={handleClick}>
            {fileName ? 'Change File' : 'Select File'}
          </Button>
        </div>
      </div>

      {helperText && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{helperText}</p>
      )}
    </div>
  )
}

export default FileUpload