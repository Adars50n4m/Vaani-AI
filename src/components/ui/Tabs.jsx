import React from 'react'

const Tabs = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

const TabsList = ({ children, className = '' }) => {
  return (
    <div
      className={`flex items-center justify-center gap-2 mb-8 p-1 rounded-full bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-800 ${className}`}
    >
      {children}
    </div>
  )
}

const TabsTrigger = ({
  children,
  active = false,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative px-7 py-3 rounded-full text-[13px] font-semibold tracking-widest uppercase transition-all duration-300 ${active
        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-900'
        } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
