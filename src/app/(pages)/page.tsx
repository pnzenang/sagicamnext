import { cookies } from 'next/headers'

import TrustedBrands, { defaultTrustedBrandsIntro } from '@/components/blocks/trusted-brands/trusted-brands'
import Features, { defaultMissionCopy, type MissionCopy } from '@/components/blocks/mission/mission'
import FAQ, { defaultHomeFAQCopy, type HomeFAQCopy } from '@/components/blocks/faq/faq'
import { logos } from '@/assets/data/trusted-brands'
import SectionSeparator from '@/components/section-separator'
import HeroSection, {
  defaultHeroSectionCopy,
  type HeroSectionCopy
} from '@/components/shadcn-studio/blocks/hero-section-12/hero-section-12'
import Pricing, { defaultFeesCopy, type FeesCopy } from '@/components/blocks/pricing/page'
import Payout, { defaultPayoutCopy, type PayoutCopy } from '@/components/blocks/payout/page'
import ContactUsPage, { defaultHomeContactCopy, type HomeContactCopy } from '../contact-us-page-10/page'
import { languageCookieName, normalizeLanguage, type AppLanguage } from '@/lib/i18n'

type HomeSearchParams = {
  lang?: string | string[]
}

type HomeContent = {
  contact: HomeContactCopy
  faq: HomeFAQCopy
  fees: FeesCopy
  hero: HeroSectionCopy
  mission: MissionCopy
  payout: PayoutCopy
  trustedBrandsIntro: string
}

const homeContent: Record<AppLanguage, HomeContent> = {
  en: {
    contact: defaultHomeContactCopy,
    faq: defaultHomeFAQCopy,
    fees: defaultFeesCopy,
    hero: defaultHeroSectionCopy,
    mission: defaultMissionCopy,
    payout: defaultPayoutCopy,
    trustedBrandsIntro: defaultTrustedBrandsIntro
  },
  fr: {
    contact: {
      badge: 'CONTACTER SAGICAM',
      imageAlt: 'Formulaire de contact',
      title: 'Contactez SAGICAM!',
      contactInfo: [
        {
          ...defaultHomeContactCopy.contactInfo[0],
          title: 'Adresse du bureau'
        },
        {
          ...defaultHomeContactCopy.contactInfo[1],
          title: 'Vous pouvez nous joindre au',
          details: ['Téléphone : 1(804)-214-6390']
        },
        {
          ...defaultHomeContactCopy.contactInfo[2],
          title: 'Courriel SAGICAM'
        }
      ]
    },
    faq: {
      badge: 'QUESTIONS FRÉQUENTES SAGICAM',
      cardTitle: 'Questions fréquentes?',
      description:
        'Un aperçu de ce que vous pouvez attendre du service SAGICAM et des réponses aux questions les plus courantes.',
      imageAlt: 'Représentant du service client',
      title: 'Questions fréquentes',
      items: [
        {
          question: 'Qui peut devenir membre de SAGICAM?',
          answer:
            'Toute personne vivant au Cameroun peut devenir membre de SAGICAM, mais elle doit être parrainée par une personne morale ou physique vivant aux États-Unis. Le lien entre le sponsor et le membre doit être familial ou amical, et le sponsor doit pouvoir soutenir financièrement le membre pendant toute la durée de son adhésion.'
        },
        {
          question: 'Comment les membres sont-ils inscrits?',
          answer:
            'Le sponsor doit créer un compte sur le site SAGICAM, puis soumettre les informations et les frais d’inscription pour ses proches.'
        },
        {
          question: 'Comment effectuer un paiement ou une cotisation avec SAGICAM?',
          answer:
            'Toutes les instructions de paiement sont disponibles sur le site SAGICAM dans le portail sponsor, après la création du compte.'
        },
        {
          question: 'Qui peut être sponsor dans SAGICAM?',
          answer:
            'Toute personne vivant aux États-Unis peut être sponsor dans SAGICAM si elle peut soutenir financièrement le membre pendant la durée de son adhésion. Le sponsor doit aussi avoir un lien familial ou amical avec la personne parrainée.'
        },
        {
          question: 'Quel est le processus pour devenir membre de SAGICAM?',
          answer:
            'Après la création du compte sponsor et la soumission des informations nécessaires, le membre est examiné pour confirmer son admissibilité. Le processus peut prendre 2 à 3 mois, période pendant laquelle le sponsor doit payer les frais et dépôts requis.'
        },
        {
          question: "À quel moment dois-je payer les frais d'inscription?",
          answer:
            "Le sponsor doit soumettre les frais d'inscription et la cotisation anticipée avant l'approbation du proche. Le proche devient membre lorsque son statut passe de pending à vested, après paiement des frais requis et au moins 60 jours de présence dans la base de données SAGICAM."
        },
        {
          question: 'Quel est le montant versé aux bénéficiaires?',
          answer:
            "Le montant dépend de l'ancienneté du membre: de 60 à 180 jours d'adhésion, 1 000 $; de 181 jours à 1 an, 2 000 $; plus d'un an, 6 000 $. Les détails complets sont disponibles dans le portail sponsor SAGICAM."
        }
      ]
    },
    fees: {
      badge: 'FRAIS ET COTISATIONS SAGICAM',
      description: 'Un aperçu des frais et cotisations pour vous aider à planifier sereinement.',
      title: 'Détails des frais et cotisations',
      plans: [
        {
          name: "Frais d'inscription",
          preview: 'Maintenant',
          price: 10,
          description: 'Frais uniques pour inscrire un proche sur la plateforme.',
          buttonText: 'Par membre',
          frequency: 'À vie',
          features: [
            '1 membre',
            "Payé dans les 60 jours suivant la date d'inscription",
            'Non remboursable et non transférable',
            "Le proche ne sera pas acquis si le paiement n'est pas effectué",
            "L'inscription est annulée si le paiement n'est pas reçu dans les 60 jours"
          ]
        },
        {
          name: 'Cotisation anticipée',
          preview: 'Maintenant',
          price: 30,
          description: 'Cotisation unique anticipée, utilisée lorsque vous ne pouvez pas cotiser.',
          buttonText: 'Par membre',
          frequency: 'Une fois',
          features: [
            '1 membre',
            "Payée dans les 60 jours suivant la date d'inscription",
            'Non remboursable et non transférable',
            "Le proche ne sera pas acquis si le paiement n'est pas effectué",
            "L'inscription est annulée si le paiement n'est pas reçu dans les 60 jours"
          ]
        },
        {
          name: 'Cotisation mensuelle',
          preview: 'environ',
          price: 9,
          description: 'Cotisation mensuelle destinée à soutenir les sponsors endeuillés.',
          buttonText: 'Par membre',
          frequency: '/mois actuellement',
          features: [
            '1 membre',
            'Due chaque mois pendant que le membre est actif',
            'Non remboursable et non transférable',
            "Le proche peut être exclu si elle n'est pas payée",
            'Peut être remplacée par la cotisation anticipée'
          ]
        }
      ]
    },
    hero: {
      badge: 'SOLUTION POUR LES FAMILLES ET AMIS VIVANT AU CAMEROUN',
      description:
        "En parrainant vos proches vivant au Cameroun avec SAGICAM, leur éventuel décès devient une responsabilité de solidarité SAGI: toute la communauté SAGICAM se mobilise pour vous soutenir dans ce moment difficile.\nSAGICAM transforme l'épreuve d'une famille en responsabilité partagée par toute la communauté, afin d'alléger les charges financières liées aux funérailles d'un proche.",
      flipWords: ['Amis.', 'Familles.', 'Générations.', 'Promotions.', 'Communautés.'],
      imageAlt: 'Illustration du soutien familial SAGICAM',
      joinLabel: 'Rejoindre SAGICAM',
      sagiLabel: 'Visiter SAGI',
      titleLead: 'SAGICAM relie'
    },
    mission: {
      badge: 'PROMESSES SAGICAM',
      description:
        "De votre neveu de 18 ans à votre grand-mère de 80 ans, SAGICAM est conçu pour vous garder connecté à vos proches, peu importe la distance ou les circonstances.\nNotre aide progressive et nos cotisations abordables sont pensées pour s'adapter à vos besoins et à votre budget, afin que vous puissiez vous concentrer sur l'essentiel: votre famille et vos amis.",
      title: "Chez SAGICAM, personne n'est laissé de côté.",
      features: [
        {
          title: "Aucune limite d'âge",
          description:
            'La plateforme SAGICAM est accessible à tous, que vos proches soient jeunes ou âgés. Elle est conçue pour une pleine accessibilité.'
        },
        {
          title: 'Aucune restriction géographique',
          description:
            "SAGICAM couvre toutes les régions afin que chacun puisse accéder à la plateforme, peu importe l'endroit où se trouve son proche au Cameroun."
        },
        {
          title: 'Aucun examen médical requis',
          description:
            "SAGICAM ne se base pas sur l'état de santé du proche. Aucun examen médical n'est nécessaire pour l'inscription."
        },
        {
          title: 'Autant de proches que nécessaire',
          description:
            'SAGICAM permet aux sponsors d’inscrire plusieurs personnes importantes, tant qu’ils peuvent assumer les obligations financières.'
        },
        {
          title: 'Aucune barrière linguistique',
          description:
            'SAGICAM offre un environnement accessible pour accompagner tous les sponsors, quelle que soit leur langue.'
        },
        {
          title: 'Aucune discrimination',
          description:
            "SAGICAM traite chaque personne de manière équitable, sans préjugé lié à la race, au genre, à la religion ou à l'âge."
        }
      ]
    },
    payout: {
      badge: 'BARÈME DES VERSEMENTS SAGICAM',
      description:
        'Résumé du barème des versements SAGICAM. Des informations plus détaillées sont disponibles dans les règles internes, dans le tableau de bord du sponsor.',
      title: 'Barème des versements SAGICAM',
      plans: [
        {
          id: 'free',
          name: 'Aucune cotisation - le sponsor reçoit:',
          price: '$0',
          features: [
            "Le proche n'était pas acquis, ou",
            'Le proche a cessé de cotiser, ou',
            "Le proche n'était pas acquis au moment du décès, ou",
            'Le décès a été annoncé après 30 jours'
          ],
          buttonText: 'Essayer gratuitement'
        },
        {
          id: 'business',
          name: 'Cotisation effectuée - le sponsor reçoit:',
          price: '$1,000',
          features: [
            'Le proche a une ancienneté de 6 mois ou moins,',
            'Le proche était acquis avant son décès, et',
            'Le décès a été annoncé dans les 10 jours suivant la date du décès'
          ],
          buttonText: 'Commencer'
        },
        {
          id: 'enterprise',
          name: 'Cotisation effectuée - le sponsor reçoit:',
          price: '$2,000',
          features: [
            'Le proche a une ancienneté de 6 à 12 mois',
            'Le proche était acquis avant son décès',
            'Le décès a été annoncé dans les 10 jours suivant la date du décès'
          ],
          buttonText: 'Voir les détails'
        },
        {
          id: 'custom',
          name: 'Cotisation effectuée - le sponsor reçoit:',
          price: '$6,000',
          features: [
            'Le proche a une ancienneté de plus de 12 mois,',
            'Le proche était acquis avant son décès, et',
            'Le décès a été annoncé dans les 10 jours suivant la date du décès'
          ],
          buttonText: 'Nous contacter'
        }
      ]
    },
    trustedBrandsIntro:
      'SAGICAM rassemble les personnes de toutes les communautés camerounaises. Reconnaissez-vous la région où se trouvent vos proches?'
  }
}

const getLanguage = (params?: HomeSearchParams, cookieLanguage?: string): AppLanguage => {
  const rawLang = Array.isArray(params?.lang) ? params.lang[0] : params?.lang

  return normalizeLanguage(rawLang ?? cookieLanguage)
}

const Home = async ({ searchParams }: { searchParams?: Promise<HomeSearchParams> }) => {
  const cookieStore = await cookies()
  const params = searchParams ? await searchParams : undefined
  const language = getLanguage(params, cookieStore.get(languageCookieName)?.value)
  const copy = homeContent[language]

  return (
    <div lang={language}>
      <HeroSection copy={copy.hero} />

      <SectionSeparator />

      <TrustedBrands brandLogos={logos} intro={copy.trustedBrandsIntro} />

      <SectionSeparator />

      <Features copy={copy.mission} />

      <SectionSeparator />

      <Pricing copy={copy.fees} />

      <SectionSeparator />

      <Payout copy={copy.payout} />

      <SectionSeparator />

      <FAQ copy={copy.faq} />

      <SectionSeparator />

      <ContactUsPage copy={copy.contact} />

      <SectionSeparator />
    </div>
  )
}

export default Home
