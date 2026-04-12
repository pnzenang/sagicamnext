'use client'

import type { JSX } from 'react'
import { useEffect, useState } from 'react'

import { motion } from 'motion/react'

import { Card, CardContent } from '@/components/ui/card'

export type Process = {
  id: string
  icon: JSX.Element
  title: string
  description: string
}

const ProcessFlow = ({ initialProcess }: { initialProcess: Process[] }) => {
  // States
  const [processStage, setProcessStage] = useState<Process[]>(initialProcess)

  useEffect(() => {
    const interval = setInterval(() => {
      setProcessStage(prevCards => {
        const newArray = [...prevCards]

        newArray.push(newArray.shift()!)

        return newArray
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className='relative mx-auto mt-2 flex h-48 w-full'>
      {processStage.map((item, index) => (
        <motion.div
          key={item.id}
          className='absolute inset-x-0 h-37.5'
          style={{
            transformOrigin: 'top center'
          }}
          animate={{
            bottom: index * 16,
            scale: 1 - index * 0.1,
            zIndex: processStage.length - index
          }}
          transition={{
            duration: 0.4,
            ease: 'easeInOut',
            delay: index * 0.05
          }}
        >
          <Card className='bg-muted shadow-none'>
            <CardContent className='space-y-6'>
              <div className='text-primary [&>svg]:size-18.5 [&>svg]:stroke-1'>{item.icon}</div>

              <div className='space-y-3'>
                <h3 className='text-3xl font-medium'>{item.title}</h3>
                <p className='text-muted-foreground text-lg'>{item.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default ProcessFlow
