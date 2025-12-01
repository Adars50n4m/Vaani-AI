import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const MagicBento = ({
  children,
  className = '',
  enableHover = true,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`liquid-glass ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={enableHover ? { 
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

export default MagicBento