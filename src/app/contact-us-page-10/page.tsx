import { MessageSquareMoreIcon, PhoneIcon, MailIcon } from 'lucide-react'

import ContactUs from '@/components/shadcn-studio/blocks/contact-us-page-10/contact-us-page-10'

// Contact information data
const contactInfo = [
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

const ContactUsPage = () => {
  return <ContactUs contactInfo={contactInfo} />
}

export default ContactUsPage
