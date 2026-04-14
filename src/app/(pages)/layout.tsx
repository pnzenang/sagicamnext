import type { ReactNode } from 'react'

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import type { Navigation } from '@/components/layout/header-navigation'

const navigationData: Navigation[] = [
  {
    title: 'Mission',
    href: '/#mission'
  },
  {
    title: 'Benefits',
    href: '/#benefits'
  },
  {
    title: 'Fees & Payments',
    href: '/#fees'
  },
  {
    title: 'FAQ',
    href: '/#faq'
  },
  {
    title: 'Contact',
    href: '/#contact'
  }
]

const PagesLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className='flex flex-col bg-[repeating-linear-gradient(45deg,color-mix(in_oklab,var(--border)40%,transparent)0,color-mix(in_oklab,var(--border)40%,transparent)1px,transparent_0,transparent_50%)] bg-size-[12px_12px] bg-fixed'>
      <div className='mx-auto h-full w-full max-w-350 px-4 sm:px-6 lg:px-8'>
        <div className='bg-background h-full w-full max-w-7xl border-x'>
          {/* Header Section */}
          <Header navigationData={navigationData} />

          {/* Main Content */}
          <main className='flex flex-1 flex-col *:scroll-mt-16'>{children}</main>

          {/* Footer Section */}
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default PagesLayout
