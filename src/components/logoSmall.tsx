import Image from 'next/image'

// Util Imports
import { cn } from '@/lib/utils'

const LogoSmall = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1719309232/newLogo_ixgk8v.svg'
        width={100}
        height={60}
        alt='logo'
      />
      {/* <span className='font-semibold'>SAGI</span> */}
    </div>
  )
}

export default LogoSmall
