import Image from 'next/image'

// Util Imports
import { cn } from '@/lib/utils'

const LogoSmall = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1775889433/sagicam_bkoygk.svg'
        width={110}
        height={55}
        alt='logo'
      />
      {/* <span className='font-semibold'>SAGI</span> */}
    </div>
  )
}

export default LogoSmall
