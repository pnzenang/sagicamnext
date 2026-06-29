import MegaFooter from '@/components/shadcn-studio/blocks/mega-footer-03/mega-footer-03'
import type { AppLanguage } from '@/lib/i18n'

const MegaFooterPage = ({ language = 'en' }: { language?: AppLanguage }) => {
  return <MegaFooter language={language} />
}

export default MegaFooterPage
