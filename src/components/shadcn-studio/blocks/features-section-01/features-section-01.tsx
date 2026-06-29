import type { ComponentType } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { BorderBeam } from '@/components/ui/border-beam'
import { MotionPreset } from '@/components/ui/motion-preset'

type Features = {
  icon: ComponentType
  title: string
  description: string
  cardBorderColor: string
  avatarTextColor: string
  avatarBgColor: string
}[]

export type FeaturesSectionCopy = {
  badge: string
  title: string
  description: string
}

const defaultFeaturesSectionCopy: FeaturesSectionCopy = {
  badge: 'SAGICAM PROMISES',
  title: ' AT SAGICAM, No One Gets Left Behind.',
  description:
    'From your 18 years old nephew to your 80 years old grandma, SAGICAM is designed to keep you connected with your loved ones, no matter the distance or circumstances.\nOur staggered helps and affordable contributions are designed to fit your needs and budget, so you can focus on what matters most - your family and friends.'
}

const Features = ({
  copy = defaultFeaturesSectionCopy,
  featuresList
}: {
  copy?: FeaturesSectionCopy
  featuresList: Features
}) => {
  return (
    <section className='py-2'>
      <MotionPreset
        fade
        zoom={{ initialScale: 0.8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        delay={0.1}
      >
        <Badge
          variant='outline'
          className='bg-background text-primary relative mx-4 mb-12 ml-8 space-y-4 py-1 font-normal'
        >
          {copy.badge}
          <BorderBeam colorFrom='var(--primary)' colorTo='var(--primary)' size={35} duration={8} />
        </Badge>
      </MotionPreset>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 space-y-4 sm:mb-16 lg:mb-24'>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>{copy.title}</h2>
          <p className='text-muted-foreground text-xl whitespace-pre-line'>{copy.description}</p>
        </div>

        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {featuresList.map((features, index) => (
            <Card key={index} className={cn('shadow-none transition-colors duration-300', features.cardBorderColor)}>
              <CardContent>
                <Avatar className='mb-6 size-10 rounded-md'>
                  <AvatarFallback
                    className={cn('rounded-md [&>svg]:size-6', features.avatarBgColor, features.avatarTextColor)}
                  >
                    <features.icon />
                  </AvatarFallback>
                </Avatar>
                <h6 className='mb-2 text-xl font-semibold sm:text-2xl'>{features.title}</h6>
                <p className='text-muted-foreground'>{features.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
