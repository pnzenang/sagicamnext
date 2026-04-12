'use client'

// React Imports
import { useEffect, useId, useRef, useState } from 'react'

// Third-party Imports
import { motion } from 'motion/react'

// Util Imports
import { cn } from '@/lib/utils'

interface TextFlipProps {
  words: string[]
  interval?: number
  className?: string
  textClassName?: string
  animationDuration?: number
}

const TextFlip = ({ words, interval = 3000, className, textClassName, animationDuration = 700 }: TextFlipProps) => {
  // States
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [width, setWidth] = useState(100)

  // Hooks
  const textRef = useRef(null)
  const id = useId()

  const updateWidthForWord = () => {
    if (textRef.current) {
      // @ts-expect-error ref typed as null, scrollWidth access is safe here
      const textWidth = textRef.current.scrollWidth

      setWidth(textWidth)
    }
  }

  useEffect(() => {
    updateWidthForWord()
  }, [currentWordIndex])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex(prevIndex => (prevIndex + 1) % words.length)

      // Width will be updated in the effect that depends on currentWordIndex
    }, interval)

    return () => clearInterval(intervalId)
  }, [words, interval])

  return (
    <motion.div
      layout
      layoutId={`words-here-${id}`}
      animate={{ width }}
      transition={{ duration: animationDuration / 2000 }}
      className={cn('relative inline-block text-start', className)}
      key={words[currentWordIndex]}
    >
      <motion.div
        transition={{
          duration: animationDuration / 1000,
          ease: 'easeInOut'
        }}
        className={cn('inline-block', textClassName)}
        ref={textRef}
        layoutId={`word-div-${words[currentWordIndex]}-${id}`}
      >
        <motion.div className='inline-block'>
          {words[currentWordIndex].split('').map((letter, index) => (
            <motion.span
              key={index}
              initial={{
                opacity: 0,
                filter: 'blur(10px)'
              }}
              animate={{
                opacity: 1,
                filter: 'blur(0px)'
              }}
              transition={{
                delay: index * 0.05
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export { TextFlip, type TextFlipProps }
