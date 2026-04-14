import TrustedBrands from '@/components/blocks/trusted-brands/trusted-brands'
import Features from '@/components/blocks/mission/mission'
import FAQ from '@/components/blocks/faq/faq'
import { logos } from '@/assets/data/trusted-brands'
import SectionSeparator from '@/components/section-separator'
import HeroSection from '@/components/shadcn-studio/blocks/hero-section-12/hero-section-12'
import Pricing from '@/components/blocks/pricing/page'
import Payout from '@/components/blocks/payout/page'
import ContactUsPage from '../contact-us-page-10/page'

const Home = () => {
  return (
    <>
      <HeroSection />

      <SectionSeparator />

      <TrustedBrands brandLogos={logos} />

      <SectionSeparator />

      <Features />

      <SectionSeparator />

      <Pricing />

      <SectionSeparator />

      <Payout />

      <SectionSeparator />

      <FAQ />

      <SectionSeparator />

      <ContactUsPage />

      <SectionSeparator />
    </>
  )
}

export default Home
