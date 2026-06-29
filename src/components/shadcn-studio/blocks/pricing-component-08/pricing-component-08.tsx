'use client'

import { useEffect } from 'react'

import { CircleIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { cn } from '@/lib/utils'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Badge } from '@/components/ui/badge'
import { BorderBeam } from '@/components/ui/border-beam'

type PricingPlans = {
  name: string
  preview?: string
  price: number
  description: string
  frequency: string
  buttonText: string
  features: string[]
}[]

export type PricingPlansSectionCopy = {
  badge: string
  title: string
  description: string
}

const defaultPricingPlansSectionCopy: PricingPlansSectionCopy = {
  badge: 'SAGICAM FFEE AND CONTRIBUTION PLANS',
  title: 'Fee and contributions Details',
  description: 'A Comprehensive Breakdown of Our Fee and Contribution Plans to Help You Make the Best Choice!'
}

const Pricing = ({
  copy = defaultPricingPlansSectionCopy,
  pricingPlans
}: {
  copy?: PricingPlansSectionCopy
  pricingPlans: PricingPlans
}) => {
  useEffect(() => {
    const all = document.querySelectorAll('.card')

    const handleMouseMove = (ev: MouseEvent) => {
      all.forEach(e => {
        const blob = e.querySelector('.blob') as HTMLElement
        const fblob = e.querySelector('.fake-blob') as HTMLElement

        if (!blob || !fblob) return

        const rec = fblob.getBoundingClientRect()

        blob.style.opacity = '0.8'

        blob.animate(
          [
            {
              transform: `translate(${
                ev.clientX - rec.left - 24 - rec.width / 2
              }px, ${ev.clientY - rec.top - 24 - rec.height / 2}px)`
            }
          ],
          {
            duration: 300,
            fill: 'forwards'
          }
        )
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className='py-2'>
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
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:space-y-16 sm:px-6 lg:space-y-24 lg:px-8'>
        <div className='flex flex-col items-start gap-4'>
          <div className='flex flex-col gap-0.5 text-start'>
            <h2 className='text-2xl font-semibold sm:text-3xl lg:text-4xl'>{copy.title}</h2>
            <Separator className='bg-primary h-px' />
          </div>
          <p className='text-muted-foreground text-start text-xl font-normal'>{copy.description}</p>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {pricingPlans.map((plan, index) => {
            // Conditionally set the button variant based on the plan
            const buttonVariant = plan.name === 'Professional' ? 'default' : 'outline'

            return (
              <div
                className={cn(
                  'bg-foreground/10 card group relative h-full overflow-hidden rounded-xl p-px transition-all duration-300 ease-in-out max-lg:last:col-span-full',
                  { 'p-0': plan.name === 'Professional' }
                )}
                key={index}
              >
                <Card
                  className={cn('group-hover:bg-card/90 h-full shadow-none transition-all duration-300 ease-in-out', {
                    'border-primary border-2': plan.name === 'Professional'
                  })}
                >
                  <CardContent className='flex flex-col gap-6'>
                    <div className='flex flex-col gap-6'>
                      <h3 className='text-3xl font-semibold'>{plan.name}</h3>
                      <div className='flex gap-0.5'>
                        <span className='text-muted-foreground self-end text-lg font-normal'>{plan.preview}:</span>
                        <span className='text-muted-foreground text-lg font-medium'>$</span>
                        <span className='text-6xl font-bold'>{plan.price}</span>
                        <span className='text-muted-foreground self-end text-lg font-normal'>{plan.frequency}</span>
                      </div>
                      <p className='text-base font-normal'>{plan.description}</p>
                    </div>

                    <Button size='lg' className='border-primary bg-primary text-white' variant={buttonVariant}>
                      {plan.buttonText}
                    </Button>

                    <div className='flex flex-col gap-1.5'>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className='flex items-center gap-2 py-1'>
                          <CircleIcon className='size-3' />
                          <span className='text-base font-normal'>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <div className='blob bg-primary absolute top-0 left-0 -z-1 size-62.5 rounded-full opacity-0 blur-2xl transition-all duration-300 ease-in-out' />
                <div className='fake-blob absolute top-0 left-0 -z-1 [display:hidden] size-40 rounded-full' />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Pricing
