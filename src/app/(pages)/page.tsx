import Hero from '@/components/blocks/hero-section/hero-section'
import TrustedBrands from '@/components/blocks/trusted-brands/trusted-brands'
import Features from '@/components/blocks/features/features'
import Benefits from '@/components/blocks/benefits/benefits'
import Testimonials from '@/components/blocks/testimonials/testimonials'
import Pricing from '@/components/blocks/pricing/pricing'
import FAQ from '@/components/blocks/faq/faq'
import CTA from '@/components/blocks/cta/cta'

import { logos } from '@/assets/data/trusted-brands'
import { plans } from '@/assets/data/pricing'

import SectionSeparator from '@/components/section-separator'
import HeroSection from '@/components/shadcn-studio/blocks/hero-section-12/hero-section-12'

const Home = () => {
  return (
    <>
      <HeroSection />

      <SectionSeparator />

      <TrustedBrands brandLogos={logos} />

      <SectionSeparator />

      <Features />

      <SectionSeparator />

      {/* <Benefits featuresList={benefits} /> */}

      <SectionSeparator />

      {/* <Testimonials /> */}

      <SectionSeparator />

      <Pricing plans={plans} />

      <SectionSeparator />

      <FAQ />

      <CTA />
    </>
  )
}

export default Home
