import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const SpotlightCard = ({
  children,
  className = '',
  enableHoverEffect = true,
  ...props
}) => {
  return (
    <motion.div
      className={`liquid-glass p-6 ${className}`}
      whileHover={enableHoverEffect ? { 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" }
      } : {}}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default SpotlightCard