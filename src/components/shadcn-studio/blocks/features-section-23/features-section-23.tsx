import { ArrowRightIcon } from 'lucide-react'

import ProcessFlow from '@/components/shadcn-studio/blocks/features-section-23/process-flow'
import type { Process } from '@/components/shadcn-studio/blocks/features-section-23/process-flow'

import { Badge } from '@/components/ui/badge'

import { MotionPreset } from '@/components/ui/motion-preset'
import { PrimaryGrowButton, SecondaryGrowButton } from '@/components/ui/grow-button'

const Features = ({ features }: { features: Process[] }) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-12 lg:grid-cols-2 xl:gap-16'>
          {/* Left content */}
          <div className='space-y-4'>
            <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.5 }}>
              <Badge variant='outline' className='text-primary bg-background relative px-3 py-1 text-sm font-normal'>
                SAGICAM PROMISES
              </Badge>
            </MotionPreset>
            <MotionPreset
              component='h2'
              className='text-2xl font-semibold md:text-4xl lg:text-5xl'
              fade
              blur
              slide={{ direction: 'down', offset: 50 }}
              delay={0.15}
              transition={{ duration: 0.5 }}
            >
              AT SAGICAM, <br />
              No One Gets Left Behind
            </MotionPreset>
            <MotionPreset
              component='p'
              className='text-muted-foreground text-xl'
              fade
              blur
              slide={{ direction: 'down', offset: 50 }}
              delay={0.3}
              transition={{ duration: 0.5 }}
            >
              From your 18 years old nephew to your 80 years old grandma, SAGICAM is designed to keep you connected with
              your loved ones, no matter the distance or circumstances. <br />
              Our staggered helps and affordable contributions are designed to fit your needs and budget, so you can
              focus on what matters most - your family and friends.
            </MotionPreset>

            <MotionPreset
              className='flex flex-wrap items-center gap-4'
              fade
              blur
              slide={{ direction: 'down', offset: 50 }}
              transition={{ duration: 0.5 }}
              delay={0.45}
            ></MotionPreset>
          </div>

          {/* Right content */}
          <MotionPreset fade blur transition={{ duration: 0.7 }} className='h-82.5 max-sm:h-97.5'>
            <ProcessFlow initialProcess={features} />
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default Features
