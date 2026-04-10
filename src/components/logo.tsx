import Image from 'next/image'

// Util Imports
import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('relative flex flex-row items-center gap-2', className)}>
      <Image
        src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1719309232/newLogo_ixgk8v.svg'
        alt='logo'
        loading='eager'
        width={100}
        height={70}
      />
      {/* <span className='hidden text-3xl font-extrabold sm:block'>SAGI</span> */}
    </div>
  )
}

export default Logo
