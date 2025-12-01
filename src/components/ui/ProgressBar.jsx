import React from 'react'
import clsx from 'clsx'

const ProgressBar = ({ value = 0, indeterminate = false, className }) => {
  return (
    <div className={clsx('w-full h-3 bg-white/5 border border-white/10 rounded-full overflow-hidden relative', className)}>
      {indeterminate ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-sky-400/60 via-white/70 to-emerald-400/60" />
      ) : (
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      )}
    </div>
  )
}

export default ProgressBar
