import { PlayIcon, RocketIcon } from 'lucide-react'

import { MotionPreset } from '@/components/ui/motion-preset'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { TextFlip } from '@/components/ui/text-flip'
import { BorderBeam } from '@/components/ui/border-beam'

export type HeroSectionCopy = {
  badge: string
  titleLead: string
  flipWords: string[]
  description: string
  imageAlt: string
}

export const defaultHeroSectionCopy: HeroSectionCopy = {
  badge: 'SOLUTION FOR FAMILIES AND FRIENDS LIVING IN CAMEROON',
  titleLead: 'SAGICAM Connects',
  flipWords: ['Friends.', 'Families.', 'Generations.', 'Promotions.', 'Communities.'],
  description:
    "By sponsoring your loved ones living in Cameroon in SAGICAM, you make their eventual passing a SAGI problem, the whole SAGICAM community will come together to support you in the trying time. At SAGICAM.\nwe the camerooninan solidarity, making one family's problem the problem of the whole community. Making it a little easier for any of us, to face up to the adversity of financially taking care of expenses related to the funeral of a loved one.",
  imageAlt: 'SAGICAM family support illustration'
}

const HeroSection = ({ copy = defaultHeroSectionCopy }: { copy?: HeroSectionCopy }) => {
  return (
    <section className='flex-1 py-4 sm:py-6 lg:py-8'>
      <div className='mx-auto flex h-full max-w-7xl flex-col gap-12 px-4 sm:gap-16 sm:px-6 lg:gap-24 lg:px-8'>
        <div className='relative grid gap-12 xl:grid-cols-5'>
          <div className='flex flex-col justify-center gap-6 xl:col-span-3'>
            <MotionPreset
              fade
              zoom={{ initialScale: 0.8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              delay={0.1}
            >
              <Badge variant='outline' className='bg-background text-primary relative px-3 py-1 font-normal'>
                {copy.badge}
                <BorderBeam colorFrom='var(--primary)' colorTo='var(--primary)' size={35} duration={8} />
              </Badge>
            </MotionPreset>
            <MotionPreset
              fade
              slide={{ direction: 'up', offset: 80 }}
              blur='8px'
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              delay={0.2}
            >
              <h1 className='max-w-3xl text-2xl leading-[1.29167] font-bold sm:text-3xl lg:text-4xl'>
                {copy.titleLead}{' '}
                <MotionPreset
                  component='div'
                  zoom={{ initialScale: 0.5 }}
                  fade
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  delay={0.5}
                  className='bg-primary/10 relative inline-block border-2 px-3'
                >
                  <TextFlip words={copy.flipWords} />
                  <MotionPreset
                    component='span'
                    zoom={{ initialScale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    delay={0.6}
                    className='bg-primary absolute -top-1.5 -left-1.5 size-2.5 rounded-xs'
                  />
                  <MotionPreset
                    component='span'
                    zoom={{ initialScale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    delay={0.65}
                    className='bg-primary absolute -top-1.5 -right-1.5 size-2.5 rounded-xs'
                  />
                  <MotionPreset
                    component='span'
                    zoom={{ initialScale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    delay={0.7}
                    className='bg-primary absolute -bottom-1.5 -left-1.5 size-2.5 rounded-xs'
                  />
                  <MotionPreset
                    component='span'
                    zoom={{ initialScale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    delay={0.75}
                    className='bg-primary absolute -right-1.5 -bottom-1.5 size-2.5 rounded-xs'
                  />
                </MotionPreset>{' '}
              </h1>
            </MotionPreset>
            <MotionPreset
              fade
              slide={{ direction: 'up', offset: 60 }}
              blur='6px'
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              delay={0.4}
            >
              <p className='text-muted-foreground text-lg whitespace-pre-line'>{copy.description}</p>
            </MotionPreset>
            <MotionPreset
              component='div'
              fade
              slide={{ direction: 'up', offset: 40 }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
              delay={0.6}
              className='flex flex-wrap items-center gap-4'
            ></MotionPreset>
          </div>
          <MotionPreset
            component='div'
            fade
            zoom={{ initialScale: 0.7 }}
            blur
            transition={{ duration: 0.4 }}
            delay={0.3}
            className='relative flex w-full items-center justify-center xl:col-span-2'
          >
            <img
              src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1775974319/Untitled_design-removebg-preview_1_qzzdqa.png'
              alt={copy.imageAlt}
              className='size-127 object-cover transition-all duration-300 hover:scale-105 hover:-rotate-2 max-sm:size-100 dark:hidden'
            />
            <img
              src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1775974319/Untitled_design-removebg-preview_1_qzzdqa.png'
              alt={copy.imageAlt}
              className='hidden size-127 object-cover transition-all duration-300 hover:scale-105 hover:-rotate-2 max-sm:size-100 dark:block'
            />
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
