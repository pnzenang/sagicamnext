import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { BorderBeam } from '@/components/ui/border-beam'
import { MotionPreset } from '@/components/ui/motion-preset'

type FAQItem = {
  question: string
  answer: string
}

type FAQComponentProps = {
  faqItems: FAQItem[]
}

const FAQ = ({ faqItems }: FAQComponentProps) => {
  return (
    <section id='faq' className='bg-muted py-8 sm:py-16 lg:py-24'>
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
          SAGICAM FREQUENTLY ASKED QUESTIONS
          <BorderBeam colorFrom='var(--primary)' colorTo='var(--primary)' size={35} duration={8} />
        </Badge>
      </MotionPreset>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 items-center gap-8 lg:grid-cols-2'>
          {/* Left Section - Dark Background with Image */}
          <MotionPreset
            fade
            slide={{ direction: 'left', offset: 50 }}
            transition={{ duration: 0.7 }}
            className='bg-primary text-primary-foreground relative z-1 h-100 overflow-hidden rounded-xl p-6 sm:h-95'
          >
            <div className='space-y-4'>
              <h2 className='text-3xl leading-tight font-semibold md:text-4xl'>
                Frequently asked <br className='hidden xl:block' /> question?
              </h2>
            </div>

            {/* Person Image */}
            <div className='h-100% absolute -right-15 -bottom-15'>
              <img
                src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1775996982/Question_ptixxz.png'
                alt='Customer support representative'
                className='h-full'
              />
            </div>

            {/* Background Pattern */}
          </MotionPreset>

          {/* Right Section - FAQ Accordion */}
          <MotionPreset fade slide={{ direction: 'right', offset: 50 }} delay={0.3} transition={{ duration: 0.7 }}>
            <Accordion type='single' collapsible className='space-y-2' defaultValue='item-0'>
              {faqItems.map((item, index) => (
                <MotionPreset
                  key={index}
                  fade
                  slide={{ direction: 'up', offset: 30 }}
                  delay={0.6 + index * 0.15}
                  transition={{ duration: 0.6 }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className='bg-card rounded-md border-b-0 shadow-md data-[state=open]:shadow-lg'
                  >
                    <AccordionTrigger className='text-primary px-5 text-base font-bold hover:no-underline [&>svg]:size-5'>
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className='text-muted-foreground px-5 text-base leading-relaxed'>
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                </MotionPreset>
              ))}
            </Accordion>
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default FAQ
