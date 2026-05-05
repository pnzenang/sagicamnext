import type { ComponentType } from 'react'

import { ChevronRightIcon, Phone, Mail, Check } from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import Image from 'next/image'

type FAQ = {
  question: string
  answer: string
}[]

type FAQTab = {
  value: string
  label: string
  icon: ComponentType
  faqs: FAQ
}[]

const FAQ = ({ tabsData }: { tabsData: FAQTab }) => {
  return (
    <section className='py-8 sm:py-8 lg:py-8'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* FAQ Header */}
        <div className='mb-12 space-y-4 md:mb-8 lg:mb-16'>
          <div className='flex w-full flex-col justify-center'>
            <h1 className='sm:text-2xl'>
              Please, click on or scan the Qr-code below to join SAGICAM the UPDATES whatsapp group in order to receive
              all the updates by whatsapp
            </h1>
            <Link href='https://chat.whatsapp.com/Cei0t0msqtB0p8BkhqnkkQ?mode=gi_t'>
              <Image
                src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1777955982/Untitled_design_gqrtw1.svg'
                width={300}
                height={300}
                alt='qr-code'
              />
            </Link>
          </div>
          <div className='mb-4 flex items-center gap-2'>
            <h2 className='mb-8 text-2xl font-semibold md:text-3xl lg:text-5xl'>NAVIGATION INSTRUCTIONS</h2>
          </div>
          <p className='text- mt-4'>
            Welcome to your SAGICAM dashboard! <br />
          </p>
          <div className='flex flex-col gap-5'>
            <h1 className=''>
              <Check className='inline pr-2' />
              Here we want to share all the processes to insure that your loved ones account are well managed, all the
              requirements are fulfilled.
            </h1>
            <h1>
              <Check className='inline pr-2' />
              All the SAGICAM transactions can be initiated from the appropriate link in the left sidebar,
            </h1>
            <h1>
              <Check className='inline pr-2' />
              Below, By clicking on the appropriate tab, you can access detailed information on how to fulfill most
              tasks.
            </h1>
            <h1>
              <Check className='inline pr-2' />
              For any further question or assistance, please don't hesitate to contact us:
              <Phone className='text-primary mr-1 ml-2 inline' />
              1(804)-214-6390
              <Mail className='text-primary mr-1 ml-2 inline' />
              info@sagicam.org
            </h1>
          </div>
        </div>

        <Tabs defaultValue='general' orientation='vertical'>
          <div className='grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3'>
            {/* Vertical Tabs List */}
            <TabsList className='h-max w-full flex-col gap-2 bg-transparent p-0'>
              {tabsData.map(tab => {
                const IconComponent = tab.icon

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className='data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:text-primary dark:data-[state=active]:bg-primary/10 border-border data-[state=active]:border-primary/20 dark:data-[state=active]:border-primary/20 bg-background w-full gap-2 rounded-lg px-6 py-2.5 text-base data-[state=active]:shadow-none! [&>svg]:size-4'
                  >
                    <IconComponent />
                    <span className='flex-1 truncate text-start'>{tab.label}</span>
                    <ChevronRightIcon className='size-4 rtl:rotate-180' />
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Tab Content */}
            <div className='lg:col-span-2'>
              {tabsData.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className='mt-0'>
                  <Accordion type='single' collapsible className='w-full rounded-lg border' defaultValue='item-1'>
                    {tab.faqs.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index + 1}`}>
                        <AccordionTrigger className='text-primary px-5 text-base'>{item.question}</AccordionTrigger>
                        <AccordionContent className='text-muted-foreground px-5 text-base'>
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  )
}

export default FAQ
