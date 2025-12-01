import React from 'react'

const Slider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  helperText,
  showValue = true,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-gray-700 dark:text-white font-medium">
          {label} {showValue && <span className="text-polo-blue dark:text-polo-lime">({value})</span>}
        </label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-2 slider ${className}`}
        {...props}
      />
      <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {helperText && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{helperText}</p>
      )}
    </div>
  )
}

export default Slider