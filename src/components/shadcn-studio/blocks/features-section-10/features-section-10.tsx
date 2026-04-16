import { CreditCardIcon, ClockIcon, CheckSquareIcon, Building2, ArrowRightIcon } from 'lucide-react'
import { SiZelle } from 'react-icons/si'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardDescription, CardContent, CardTitle } from '@/components/ui/card'

const Features = () => {
  return (
    <section className='py-8 sm:py-16 lg:py-16'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Feature Cards Grid */}
        <div className='flex gap-6 max-lg:flex-col'>
          {/* Card 1 */}
          <Card className='group hover:border-primary hover:bg-muted dark:border-primary/30 flex-1 transition-all duration-500 hover:flex-2'>
            <CardContent className='flex'>
              <div className='space-y-6'>
                <Avatar className='size-10 shadow-sm'>
                  <AvatarFallback className='bg-card text-primary'>
                    <Building2 className='size-5' />
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-2'>
                  <CardTitle className='text-primary line-clamp-2 text-lg font-semibold sm:text-4xl'>
                    Bank Deposit.
                  </CardTitle>
                  <CardDescription className='line-clamp-2'>
                    Bank:<span className='px-5 font-bold group-hover:text-4xl'>Bank Of America.</span>
                  </CardDescription>
                  <CardDescription className='line-clamp-2'>
                    Routing Number:
                    <span className='font-bold group-hover:text-4xl sm:px-5'>052001633.</span>
                  </CardDescription>
                  <CardDescription className='line-clamp-2 focus:text-center'>
                    Account #:
                    <span className='font-bold group-hover:text-4xl sm:pl-5'>4460 0867 6977</span>
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className='group flex-1 border-amber-600/30 transition-all duration-500 hover:flex-2 hover:border-amber-600 hover:bg-amber-600/10 dark:border-amber-400/30 dark:hover:border-amber-400 dark:hover:bg-amber-400/10'>
            <CardContent className='flex'>
              <div className='space-y-6'>
                <Avatar className='size-10 shadow-sm'>
                  <AvatarFallback className='bg-card text-amber-600 dark:text-amber-400'>
                    <SiZelle className='size-5' />
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-2'>
                  <CardTitle className='line-clamp-2 text-lg text-amber-600 sm:text-4xl dark:text-amber-400'>
                    Zelle Payment
                  </CardTitle>
                  <CardDescription className='line-clamp-2'>
                    Organization Name:
                    <span className='px-2 font-bold group-hover:text-4xl'>Active Solidarity Ltd.</span>
                  </CardDescription>
                  <CardDescription className='line-clamp-2'>
                    Email Address:<span className='px-5 font-bold group-hover:text-4xl'>info@sagiusa.org</span>
                  </CardDescription>
                  <CardTitle className='mt-8 line-clamp-2 text-lg font-semibold text-amber-600 group-hover:text-4xl dark:text-amber-400'>
                    CashApp
                  </CardTitle>

                  <CardDescription className='line-clamp-2 font-bold group-hover:text-4xl'>
                    Coming Soon...
                  </CardDescription>
                </div>
                <div className='space-y-2'></div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className='group flex-1 border-sky-600/30 transition-all duration-500 hover:flex-2 hover:border-sky-600 hover:bg-sky-600/10 dark:border-sky-400/30 dark:hover:border-sky-400 dark:hover:bg-sky-400/10'>
            <CardContent className='flex'>
              <div className='space-y-6'>
                <Avatar className='size-10 shadow-sm'>
                  <AvatarFallback className='bg-card text-sky-600 dark:text-sky-400'>
                    <CreditCardIcon className='size-5' />
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-2 group-hover:items-center'>
                  <CardTitle className='line-clamp-2 text-lg font-semibold text-sky-600 sm:text-4xl dark:text-sky-400'>
                    Credit/Debit Card
                  </CardTitle>
                  <CardDescription className='line-clamp-2 font-bold group-hover:text-4xl'>
                    Coming Soon...
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Features
