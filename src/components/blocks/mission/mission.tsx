import { MdAllInclusive } from 'react-icons/md'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { RiHealthBookLine } from 'react-icons/ri'
import { MdLockOpen } from 'react-icons/md'
import { LuLanguages } from 'react-icons/lu'
import { PiExclude } from 'react-icons/pi'

import Features, {
  type FeaturesSectionCopy
} from '@/components/shadcn-studio/blocks/features-section-01/features-section-01'

type MissionFeatureCopy = {
  title: string
  description: string
}

export type MissionCopy = FeaturesSectionCopy & {
  features: MissionFeatureCopy[]
}

const featureStyles = [
  {
    icon: MdAllInclusive,
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: FaMapMarkerAlt,
    cardBorderColor: 'border-green-600/40 hover:border-green-600 dark:border-green-400/40 dark:hover:border-green-400',
    avatarTextColor: 'text-green-600 dark:text-green-400',
    avatarBgColor: 'bg-green-600/10 dark:bg-green-400/10'
  },
  {
    icon: RiHealthBookLine,
    cardBorderColor: 'border-amber-600/40 hover:border-amber-600 dark:border-amber-600/40 dark:hover:border-amber-600',
    avatarTextColor: 'text-amber-600 dark:text-amber-600',
    avatarBgColor: 'bg-amber-600/10 dark:bg-amber-600/10'
  },
  {
    icon: MdLockOpen,
    cardBorderColor: 'border-destructive/40 hover:border-destructive',
    avatarTextColor: 'text-destructive',
    avatarBgColor: 'bg-destructive/10'
  },
  {
    icon: LuLanguages,
    cardBorderColor: 'border-sky-600/40 hover:border-sky-600 dark:border-sky-400/40 dark:hover:border-sky-400',
    avatarTextColor: 'text-sky-600 dark:text-sky-400',
    avatarBgColor: 'bg-sky-600/10 dark:bg-sky-400/10'
  },
  {
    icon: PiExclude,
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  }
]

export const defaultMissionCopy: MissionCopy = {
  badge: 'SAGICAM PROMISES',
  title: ' AT SAGICAM, No One Gets Left Behind.',
  description:
    'From your 18 years old nephew to your 80 years old grandma, SAGICAM is designed to keep you connected with your loved ones, no matter the distance or circumstances.\nOur staggered helps and affordable contributions are designed to fit your needs and budget, so you can focus on what matters most - your family and friends.',
  features: [
    {
      title: 'No Age Limitations',
      description:
        'SAGICAM platform is available to everyone, regardless of whether the loved ones are young or old. It is open for full accessibility.'
    },
    {
      title: 'No Geographical Restrictions',
      description:
        "SAGICAM covers all regions, ensuring that everyone has access to our platform regardless of their loved one's location in cameroon."
    },
    {
      title: 'No Health Checks Required',
      description:
        "SAGICAM is not interested in the loved one's health status. No medical exam or health check is needed to get registered."
    },
    {
      title: 'Any Number Of Loved Ones',
      description:
        'SAGICAM allows sponsors to register any number of people of significant importance if they can handle the financial obligations.'
    },
    {
      title: 'No Language Barriers',
      description:
        'SAGICAM provides an environment with high accessibility, want to support all sponsors no matter their language of if they speak at all.'
    },
    {
      title: 'No Discrimination or Bias',
      description:
        'SAGICAM treats all individuals equally, fairly, and without prejudice based on characteristics like race, gender, religion, or age.'
    }
  ]
}

const FeaturesPage = ({ copy = defaultMissionCopy }: { copy?: MissionCopy }) => {
  const featuresList = copy.features.map((feature, index) => ({
    ...featureStyles[index],
    ...feature
  }))

  return (
    <section id='mission' className='py-8 sm:py-16 lg:py-24'>
      <Features
        copy={{
          badge: copy.badge,
          description: copy.description,
          title: copy.title
        }}
        featuresList={featuresList}
      />
    </section>
  )
}

export default FeaturesPage
