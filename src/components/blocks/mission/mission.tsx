import { MdAllInclusive } from 'react-icons/md'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { RiHealthBookLine } from 'react-icons/ri'
import { MdLockOpen } from 'react-icons/md'
import { LuLanguages } from 'react-icons/lu'
import { PiExclude } from 'react-icons/pi'
import Features from '@/components/shadcn-studio/blocks/features-section-01/features-section-01'

const featuresList = [
  {
    icon: MdAllInclusive,
    title: 'No Age Limitations',
    description:
      'SAGICAM platform is available to everyone, regardless of whether the loved ones are young or old. It is open for full accessibility.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: FaMapMarkerAlt,
    title: 'No Geographical Restrictions',
    description:
      "SAGICAM covers all regions, ensuring that everyone has access to our platform regardless of their loved one's location in cameroon.",
    cardBorderColor: 'border-green-600/40 hover:border-green-600 dark:border-green-400/40 dark:hover:border-green-400',
    avatarTextColor: 'text-green-600 dark:text-green-400',
    avatarBgColor: 'bg-green-600/10 dark:bg-green-400/10'
  },
  {
    icon: RiHealthBookLine,
    title: 'No Health Checks Required',
    description:
      "SAGICAM is not interested in the loved one's health status. No medical exam or health check is needed to get registered.",
    cardBorderColor: 'border-amber-600/40 hover:border-amber-600 dark:border-amber-600/40 dark:hover:border-amber-600',
    avatarTextColor: 'text-amber-600 dark:text-amber-600',
    avatarBgColor: 'bg-amber-600/10 dark:bg-amber-600/10'
  },
  {
    icon: MdLockOpen,
    title: 'Any Number Of Loved Ones',
    description:
      'SAGICAM allows sponsors to register any number of people of significant importance if they can handle the financial obligations.',
    cardBorderColor: 'border-destructive/40 hover:border-destructive',
    avatarTextColor: 'text-destructive',
    avatarBgColor: 'bg-destructive/10'
  },
  {
    icon: LuLanguages,
    title: 'No Language Barriers',
    description:
      'SAGICAM provides an environment with high accessibility, want to support all sponsors no matter their language of if they speak at all.',
    cardBorderColor: 'border-sky-600/40 hover:border-sky-600 dark:border-sky-400/40 dark:hover:border-sky-400',
    avatarTextColor: 'text-sky-600 dark:text-sky-400',
    avatarBgColor: 'bg-sky-600/10 dark:bg-sky-400/10'
  },
  {
    icon: PiExclude,
    title: 'No Discrimination or Bias',
    description:
      'SAGICAM treats all individuals equally, fairly, and without prejudice based on characteristics like race, gender, religion, or age.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  }
]

const FeaturesPage = () => {
  return (
    <section id='mission' className='py-8 sm:py-16 lg:py-24'>
      <Features featuresList={featuresList} />
    </section>
  )
}

export default FeaturesPage
