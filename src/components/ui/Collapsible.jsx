import React, { useState } from 'react'
import Button from './Button'

const Collapsible = ({ 
  title, 
  children, 
  defaultOpen = false,
  className = '',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`space-y-4 ${className}`} {...props}>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span>{title}</span>
        <span className={`transition-transform text-xs ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </Button>
      
      {isOpen && (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

export default Collapsible