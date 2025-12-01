import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TTSSection from './components/TTSSection'
import VCSection from './components/VCSection'
import VoiceModelPanel from './components/VoiceModelPanel'
import DubbingPanel from './components/DubbingPanel'
import Navbar from './components/Navbar'
import { AudioSampleProvider } from './context/AudioSampleContext'
import usePersistentState from './hooks/usePersistentState'
import { GlowingEffect } from './components/ui/glowing-effect'
import './index.css'

const menuOptions = [
  { id: 'text-to-speech', label: 'Text to Speech', short: 'TTS', description: 'Multilingual studio-grade synthesis', accent: 'from-sky-400/70 via-blue-500/70 to-indigo-600/60' },
  { id: 'voice-change', label: 'Voice Change', short: 'VC', description: 'Realtime conversion with cloning', accent: 'from-purple-400/70 via-fuchsia-500/60 to-pink-500/60' },
  { id: 'voice-model', label: 'Voice Model', short: 'VM', description: 'Train & manage signature voices', accent: 'from-emerald-400/70 via-green-500/60 to-lime-400/60' },
  { id: 'dubbing', label: 'Dubbing', short: 'DX', description: 'Auto-sync dialogue for global launches', accent: 'from-amber-400/70 via-orange-500/60 to-rose-500/60' },
  { id: 'about', label: 'About', short: 'AB', description: 'Learn about the Vaani AI stack', accent: 'from-slate-400/70 via-gray-500/60 to-stone-500/60' },
]

const experiencePanels = {
  'about': {
    badge: 'Creator & Architecture',
    title: 'About Vaani AI',
    subtitle: 'A state-of-the-art AI voice synthesis platform designed and built by Adarsh Thakur.',
    features: [
      { title: 'Advanced Voice Cloning', description: 'Few-shot voice cloning capabilities that capture unique vocal characteristics instantly.' },
      { title: 'Multilingual Engine', description: 'Seamless text-to-speech synthesis across 16+ languages including Hindi and English.' },
      { title: 'Premium UI Design', description: 'A polished, dark-mode first interface crafted by Adarsh Thakur for optimal user experience.' }
    ],
    metrics: [
      { label: 'Creator', value: 'Adarsh Thakur' },
      { label: 'Stack', value: 'React · Python' },
      { label: 'Focus', value: 'GenAI · UI/UX' }
    ],
    previewTitle: 'How It Works',
    previewDescription: 'Vaani AI leverages advanced deep learning models to analyze reference audio and generate high-fidelity speech, all orchestrated through a responsive, modern web interface.',
    cta: 'Contact Adarsh',
    secondaryCta: 'View Documentation'
  }
}

function AppLayout() {
  const [activeSection, setActiveSection] = usePersistentState('vaani_active_section', 'text-to-speech')

  const isStudioMode = activeSection === 'text-to-speech' || activeSection === 'voice-change'
  const nonStudioPanel = (!isStudioMode && !['voice-model', 'dubbing'].includes(activeSection))
    ? experiencePanels[activeSection]
    : null

  const handleMenuSelect = (optionId) => {
    setActiveSection(optionId)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-polo-black dark:text-white relative overflow-hidden font-sans selection:bg-polo-lime/30">

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 space-y-8 lg:space-y-12">
          <Navbar menuOptions={menuOptions} activeSection={activeSection} onSelect={handleMenuSelect} />

          <main className="space-y-12">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className={isStudioMode ? "min-h-[600px]" : "polo-card overflow-hidden min-h-[600px]"}>
                <div className="relative p-6 sm:p-10 space-y-12">
                  {isStudioMode ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        {activeSection === 'text-to-speech' ? <TTSSection /> : <VCSection />}
                      </motion.div>
                    </AnimatePresence>
                  ) : activeSection === 'voice-model' ? (
                    <VoiceModelPanel />
                  ) : activeSection === 'dubbing' ? (
                    <DubbingPanel />
                  ) : nonStudioPanel ? (
                    <div className="grid gap-12 lg:grid-cols-2 items-start">
                      <div className="space-y-8">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">
                          {nonStudioPanel.badge}
                        </span>
                        <div className="space-y-4">
                          <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {nonStudioPanel.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                            {nonStudioPanel.subtitle}
                          </p>
                        </div>
                        <ul className="grid grid-cols-1 gap-4">
                          {nonStudioPanel.features.map((feature) => (
                            <li key={feature.title} className="group relative rounded-2xl border border-gray-200 dark:border-gray-800 p-1">
                              <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                              />
                              <div className="relative flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-black h-full">
                                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-polo-lime text-black text-xs font-bold shrink-0">
                                  ✦
                                </span>
                                <div>
                                  <p className="text-gray-900 dark:text-white font-semibold">{feature.title}</p>
                                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{feature.description}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-4 pt-4">
                          {nonStudioPanel.cta && (
                            <button className="btn-primary inline-flex items-center gap-2 text-sm uppercase tracking-wider font-bold">
                              {nonStudioPanel.cta}
                            </button>
                          )}
                          {nonStudioPanel.secondaryCta && (
                            <button className="btn-secondary inline-flex items-center gap-2 text-sm uppercase tracking-wider font-bold">
                              {nonStudioPanel.secondaryCta}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-black p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 space-y-8">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                            {nonStudioPanel.previewTitle}
                          </p>
                          <p className="text-xl text-gray-900 dark:text-white mt-3 font-medium">
                            {nonStudioPanel.previewDescription}
                          </p>
                        </div>
                        {nonStudioPanel.metrics && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {nonStudioPanel.metrics.map((metric) => (
                              <div key={metric.label} className="rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">{metric.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{metric.value}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            Menu options route the studio into deeper feature stacks. Voice Model, Dubbing, AI Agent, and About panels give you a guided look before opening the dedicated modules.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}

const App = () => (
  <AudioSampleProvider>
    <AppLayout />
  </AudioSampleProvider>
)

export default App
