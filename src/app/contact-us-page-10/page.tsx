import { MessageSquareMoreIcon, PhoneIcon, MailIcon } from 'lucide-react'

import ContactUs, {
  type ContactSectionCopy
} from '@/components/shadcn-studio/blocks/contact-us-page-10/contact-us-page-10'

type ContactInfo = {
  icon: typeof MessageSquareMoreIcon
  title: string
  details: string[]
}

export type HomeContactCopy = ContactSectionCopy & {
  contactInfo: ContactInfo[]
}

export const defaultHomeContactCopy: HomeContactCopy = {
  badge: 'GETTING IN TOUCH WITH SAGICAM',
  title: 'Get in touch with SAGICAM!',
  imageAlt: 'Contact Form',
  contactInfo: [
    {
      icon: MessageSquareMoreIcon,
      title: 'Office Location',
      details: ['9711 Washingtonian Blvd Suite 550, Gaithersburg, MD 20878']
    },
    {
      icon: PhoneIcon,
      title: 'You can reach us at',
      details: ['Phone : 1(804)-214-6390']
    },
    {
      icon: MailIcon,
      title: 'SAGICAM Email',
      details: ['info@sagicam.org']
    }
  ]
}

const ContactUsPage = ({ copy = defaultHomeContactCopy }: { copy?: HomeContactCopy }) => {
  return (
    <ContactUs
      contactInfo={copy.contactInfo}
      copy={{
        badge: copy.badge,
        imageAlt: copy.imageAlt,
        title: copy.title
      }}
    />
  )
}

export default ContactUsPage
