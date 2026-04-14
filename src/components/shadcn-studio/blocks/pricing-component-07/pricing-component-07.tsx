'use client'

import { useState } from 'react'

import { CheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Badge } from '@/components/ui/badge'
import { BorderBeam } from '@/components/ui/border-beam'
import { Separator } from '@/components/ui/separator'

type PlanType = 'free' | 'business' | 'enterprise' | 'custom'

export type Plan = {
  id: PlanType
  name: string

  price: string

  features: string[]
  buttonText: string
}

const Pricing = ({ plans }: { plans: Plan[] }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('free')

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan)!

  return (
    <section className='py-8 sm:py-16 lg:py-24'>
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
          SAGICAM PAYOUT SCHEDULE
          <BorderBeam colorFrom='var(--primary)' colorTo='var(--primary)' size={35} duration={8} />
        </Badge>
      </MotionPreset>
      <div className='mx-auto space-y-12 px-4 sm:space-y-16 sm:px-6 lg:space-y-24 lg:px-8'>
        <div className='flex max-w-7xl flex-col gap-4'>
          <div className='flex flex-col items-start gap-4'>
            <div className='flex flex-col gap-0.5 text-start'>
              <h2 className='text-2xl font-semibold sm:text-3xl lg:text-4xl'>SAGICAM Payout Schedule</h2>
              <Separator className='bg-primary h-px' />
            </div>
            <p className='text-muted-foreground text-start text-xl font-normal'>
              A Comprehensive Summary of SAGICAM Payout Schedule the more detailed information is available in the
              SAGICAM Internal Rules in the sponsor dashboard.
            </p>
          </div>
        </div>
        <div className='flex flex-col gap-6 lg:flex-row'>
          <div className='flex flex-1 flex-col gap-5'>
            {plans.map((plan, index) => (
              <MotionPreset
                key={plan.id}
                fade
                blur
                slide={{ direction: 'up', offset: 50 }}
                delay={0.6 + index * 0.15}
                transition={{ duration: 0.7 }}
              >
                <Card
                  className={cn(
                    `cursor-pointer shadow-none transition-colors ${
                      selectedPlan === plan.id ? 'bg-muted border-primary' : 'border-border'
                    }`
                  )}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardContent className='flex items-center gap-4'>
                    <div className='border-input flex size-6 items-center justify-center rounded-full border'>
                      {selectedPlan === plan.id && <div className='bg-primary size-4 rounded-full' />}
                    </div>
                    <div className='flex flex-1 flex-col gap-0.5'>
                      <p className='text-base font-semibold'>{plan.name}</p>
                    </div>
                    <div className='flex items-end gap-0.5'>
                      <span className='text-3xl font-bold'>{plan.price}</span>
                    </div>
                  </CardContent>
                </Card>
              </MotionPreset>
            ))}
          </div>

          <MotionPreset
            key={selectedPlan}
            className='bg-primary flex-1 rounded-2xl p-6'
            fade
            blur
            zoom={{ initialScale: 0.95 }}
            delay={0.3}
            transition={{ duration: 0.6 }}
          >
            <div className='mb-6 flex flex-col gap-1'>
              <h3 className='text-primary-foreground text-3xl font-semibold'>{selectedPlanData.name}</h3>
            </div>

            <Card className='shadow-none'>
              <CardContent className='flex flex-col gap-4'>
                <div className='flex items-end gap-0.5'>
                  <span className='text-4xl font-semibold'>{selectedPlanData.price}</span>
                  <span className='text-muted-foreground text-lg'></span>
                </div>
                <div className='flex flex-col gap-2'>
                  {selectedPlanData.features.map((feature, index) => (
                    <div key={index} className='flex items-center gap-2 py-1'>
                      <CheckIcon className='size-4.5' />
                      <span className='text-base font-medium'>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default Pricing
