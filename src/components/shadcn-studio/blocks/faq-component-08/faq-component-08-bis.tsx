import type { ComponentType } from 'react'

import { BookOpenCheck, ChevronRightIcon, Download, FileText, Scale } from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const rulesCount = tabsData.reduce((total, tab) => total + tab.faqs.length, 0)

  return (
    <section className='py-6 sm:py-8'>
      <div className='mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8'>
        <div className='overflow-hidden rounded-md border'>
          <div className='bg-muted/40 px-5 py-6 sm:px-8 sm:py-8'>
            <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
              <div className='max-w-3xl space-y-4'>
                <div className='inline-flex size-12 items-center justify-center rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'>
                  <Scale className='size-6' aria-hidden='true' />
                </div>
                <div className='space-y-3'>
                  <h1 className='text-2xl font-semibold tracking-normal sm:text-4xl'>Internal Rules At Glance</h1>
                  <p className='text-muted-foreground text-base leading-7 sm:text-lg'>
                    Review SAGICAM&apos;s internal rules by section. Select a section on the left, then open any rule to
                    read the details.
                  </p>
                </div>
              </div>

              <div className='flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch'>
                <Button asChild className='w-full sm:w-auto lg:w-full'>
                  <a href='/documents/sagicam-internal-rules.pdf' download='SAGICAM Internal Rules.pdf'>
                    <Download aria-hidden='true' />
                    Download PDF
                  </a>
                </Button>

                <div className='grid grid-cols-2 gap-3 sm:flex lg:grid lg:grid-cols-2'>
                  <div className='rounded-md border bg-background px-4 py-3 text-left'>
                    <div className='text-2xl font-semibold'>{tabsData.length}</div>
                    <div className='text-muted-foreground text-xs uppercase'>Sections</div>
                  </div>
                  <div className='rounded-md border bg-background px-4 py-3 text-left'>
                    <div className='text-2xl font-semibold'>{rulesCount}</div>
                    <div className='text-muted-foreground text-xs uppercase'>Rules</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue='section1' orientation='vertical'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,340px)_1fr]'>
            <div className='rounded-md border bg-background p-3'>
              <div className='mb-3 flex items-center gap-2 px-2'>
                <BookOpenCheck className='text-primary size-5' aria-hidden='true' />
                <h2 className='text-sm font-semibold uppercase'>Rule Sections</h2>
              </div>
              <TabsList className='h-auto max-h-[620px] w-full flex-col gap-2 overflow-y-auto bg-transparent p-0'>
              {tabsData.map(tab => {
                const IconComponent = tab.icon

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className='data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:text-primary dark:data-[state=active]:bg-primary/10 border-border data-[state=active]:border-primary/20 dark:data-[state=active]:border-primary/20 bg-background w-full gap-3 rounded-md border px-3 py-3 text-sm data-[state=active]:shadow-none! [&>svg]:size-4'
                  >
                    <IconComponent />
                    <span className='flex-1 truncate text-start'>{tab.label}</span>
                    <ChevronRightIcon className='size-4 rtl:rotate-180' />
                  </TabsTrigger>
                )
              })}
              </TabsList>
            </div>

            <div className='min-w-0'>
              {tabsData.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className='mt-0'>
                  <div className='rounded-md border bg-background'>
                    <div className='border-b px-5 py-5 sm:px-6'>
                      <div className='mb-2 flex flex-wrap items-center gap-2'>
                        <Badge variant='secondary'>{tab.faqs.length} rule(s)</Badge>
                        <Badge variant='outline'>SAGICAM</Badge>
                      </div>
                      <div className='flex items-start gap-3'>
                        <FileText className='text-primary mt-1 size-5 shrink-0' aria-hidden='true' />
                        <h2 className='text-xl font-semibold sm:text-2xl'>{tab.label}</h2>
                      </div>
                    </div>
                    <Accordion type='single' collapsible className='w-full' defaultValue='item-1'>
                      {tab.faqs.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index + 1}`} className='px-5 sm:px-6'>
                          <AccordionTrigger className='text-primary text-base leading-6 hover:no-underline'>
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className='text-muted-foreground text-base leading-7'>
                            {item.answer || 'No additional details provided.'}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
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
