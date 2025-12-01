import React from 'react'

const Input = ({
  label,
  type = 'text',
  className = '',
  error,
  helperText,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-gray-700 dark:text-white font-medium">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`input-field w-full bg-gray-50 dark:bg-black border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{helperText}</p>
      )}
    </div>
  )
}

const Textarea = ({
  label,
  className = '',
  error,
  helperText,
  rows = 4,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-gray-700 dark:text-white font-medium">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`input-field w-full resize-none bg-gray-50 dark:bg-black border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{helperText}</p>
      )}
    </div>
  )
}

export { Input, Textarea }