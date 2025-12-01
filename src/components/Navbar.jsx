import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx';
import usePersistentState from '../hooks/usePersistentState';

// Slim, compact navbar focusing on labels + subtitles only
const Navbar = ({ menuOptions, activeSection, onSelect }) => {
  const [theme, setTheme] = usePersistentState('vaani_theme', 'light')

  React.useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('vaani_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      const root = window.document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('vaani_theme', newTheme);
      return newTheme;
    });
  }

  return (
    <div className="relative z-20 flex justify-center items-center gap-4">
      <div className="relative rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-black px-2 py-2 shadow-sm transition-colors duration-300">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 items-center">
            <AnimatePresence>
              {menuOptions.map((option) => {
                const isActive = option.id === activeSection
                return (
                  <motion.button
                    key={option.id}
                    layout
                    onClick={() => onSelect(option.id)}
                    className={clsx(
                      'relative px-6 py-2.5 rounded-full transition-all duration-300 text-sm font-semibold tracking-wide whitespace-nowrap',
                      isActive
                        ? 'bg-polo-lime text-black shadow-md shadow-polo-lime/20'
                        : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {option.label}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="p-3 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all shadow-sm"
        aria-label="Toggle Theme"
        type="button"
      >{theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
      )}
      </button>
    </div>
  )
}

export default Navbar
