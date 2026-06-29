import type { ComponentType } from 'react'

import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { BorderBeam } from '@/components/ui/border-beam'
import { MotionPreset } from '@/components/ui/motion-preset'

type ContactInfo = {
  icon: ComponentType
  title: string
  details: string[]
}[]

export type ContactSectionCopy = {
  badge: string
  title: string
  imageAlt: string
}

const defaultContactSectionCopy: ContactSectionCopy = {
  badge: 'GETTING IN TOUCH WITH SAGICAM',
  title: 'Get in touch with SAGICAM!',
  imageAlt: 'Contact Form'
}

const ContactUs = ({
  contactInfo,
  copy = defaultContactSectionCopy
}: {
  contactInfo: ContactInfo
  copy?: ContactSectionCopy
}) => {
  return (
    <section id='contact' className='bg-muted py-8 sm:py-16 lg:py-24'>
      <MotionPreset
        fade
        zoom={{ initialScale: 0.8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        delay={0.1}
      >
        <Badge variant='outline' className='bg-background text-primary relative mx-4 my-2 ml-8 space-y-2 font-normal'>
          {copy.badge}
          <BorderBeam colorFrom='var(--primary)' colorTo='var(--primary)' size={35} duration={8} />
        </Badge>
      </MotionPreset>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid items-center gap-12 md:grid-cols-2 md:gap-16 lg:gap-24'>
          {/* Contact Info */}
          <div>
            <div className='space-y-4'>
              <MotionPreset
                component='h2'
                className='my-12 text-2xl font-semibold md:text-3xl lg:text-4xl'
                fade
                blur
                slide={{ direction: 'up', offset: 50 }}
                delay={0.3}
                transition={{ duration: 0.5 }}
              >
                {copy.title}
              </MotionPreset>
            </div>

            <div className='space-y-8 p-6'>
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon

                return (
                  <MotionPreset
                    key={index}
                    className='flex items-center gap-10'
                    fade
                    blur
                    slide={{ direction: 'up', offset: 50 }}
                    delay={0.6 + index * 0.15}
                    transition={{ duration: 0.5 }}
                  >
                    <div className='relative [&>svg]:size-10'>
                      <span className='bg-primary/10 text-primary absolute -top-2 left-2.5 size-10 rounded-full'></span>
                      <IconComponent />
                    </div>
                    <div className='flex-1 space-y-1'>
                      <h3 className='text-primary text-lg font-bold'>{info.title}</h3>
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className='text-muted-foreground text-sm'>
                          {detail}
                        </p>
                      ))}
                    </div>
                  </MotionPreset>
                )
              })}
            </div>
          </div>

          {/* Image */}
          {/* <MotionPreset fade blur zoom={{ initialScale: 0.9 }} delay={0.3} transition={{ duration: 0.8 }}> */}
          <Image
            src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1776095057/contact_wzb69b.svg'
            alt={copy.imageAlt}
            width={500}
            height={500}
            className='rounded-lg shadow-lg'
          />
          {/* </MotionPreset> */}
        </div>
      </div>
    </section>
  )
}

export default ContactUs
