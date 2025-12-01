import React from 'react'
import { motion } from 'framer-motion'

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'tts', label: 'Text to Speech' },
    { id: 'vc', label: 'Voice Conversion' }
  ]

  return (
    <div className="flex justify-center mb-8">
      <div className="glass-card p-2 flex space-x-2">
        {tabs.map((tab) => {
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default TabNavigation