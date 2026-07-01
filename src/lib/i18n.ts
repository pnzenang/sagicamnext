import type { MenuItem, MenuSubItem } from '@/utils/types'
import {
  contributionStatus,
  deceasedMemberDocumentStatusLabels,
  deceasedMemberDocumentStatuses,
  memberStatus,
  memberTransferRequestStatusLabels,
  memberTransferRequestStatuses,
  nameChangeRequestStatusLabels,
  nameChangeRequestStatuses,
  type DeceasedMemberDocumentStatus,
  type MemberTransferRequestStatus,
  type NameChangeRequestStatus
} from '@/utils/types'

export const languageCookieName = 'sagi-language'

export const supportedLanguages = ['en', 'fr'] as const

export type AppLanguage = (typeof supportedLanguages)[number]

type LanguageOption = {
  label: string
  shortLabel: string
  ariaLabel: string
}

export const languageOptions: Record<AppLanguage, LanguageOption> = {
  en: {
    label: 'English',
    shortLabel: 'EN',
    ariaLabel: 'Show site in English'
  },
  fr: {
    label: 'Français',
    shortLabel: 'FR',
    ariaLabel: 'Afficher le site en français'
  }
}

export const normalizeLanguage = (value?: string | string[] | null): AppLanguage => {
  const language = Array.isArray(value) ? value[0] : value

  return language === 'fr' ? 'fr' : 'en'
}

export const getLanguageSetHref = (language: AppLanguage, next: string) => {
  const params = new URLSearchParams({
    lang: language,
    next
  })

  return `/api/language?${params.toString()}`
}

export const publicText = {
  en: {
    login: 'Login',
    footerRights: 'All rights reserved.'
  },
  fr: {
    login: 'Connexion',
    footerRights: 'Tous droits réservés.'
  }
} as const

export const dashboardText = {
  en: {
    brand: 'SAGICAM',
    sidebar: {
      admin: 'Admin'
    }
  },
  fr: {
    brand: 'SAGICAM',
    sidebar: {
      admin: 'Admin'
    }
  }
} as const

const publicNavigationLabelTranslations: Record<string, string> = {
  Benefits: 'Avantages',
  Contact: 'Contact',
  FAQ: 'FAQ',
  'Fees & Payments': 'Frais et paiements',
  Mission: 'Mission'
}

export const translatePublicNavigationLabel = (label: string, language: AppLanguage) =>
  language === 'fr' ? (publicNavigationLabelTranslations[label] ?? label) : label

const dashboardMenuLabelTranslations: Record<string, string> = {
  Admin: 'Admin',
  'Admin Count': 'Décompte',
  'Admin Deceased': 'Membres décédés',
  'Admin Death Documentations': 'Documents de décès admin',
  'Admin Member Transfers': 'Transferts de membres',
  'Admin Members': 'Membres',
  'Admin Name Changes': 'Changements de nom',
  'Admin Removed': 'Membres retirés',
  'All Deceased Loved Ones': 'Tous les proches décédés',
  'All Loved Ones': 'Tous les proches',
  'All Removed Loved Ones': 'Tous les proches retirés',
  'Contributions Payments': 'Paiements des cotisations',
  'Death Announcement': 'Annonce de décès',
  'Death Documentations': 'Documents de décès',
  'Internal Rules At Glance': 'Aperçu des règles internes',
  'Join WhatsApp Group': 'Rejoindre le groupe WhatsApp',
  'Member Transfer': 'Transfert de membre',
  'Name Change & Documentations': 'Changement de nom et documents',
  'New Additions': 'Nouveaux ajouts',
  'Payment Instructions': 'Instructions de paiement',
  'Registration Payments': "Paiements d'inscription",
  'Remove Member': 'Retirer un membre',
  'Sagicam Contributions': 'Cotisations SAGICAM',
  'Sagicam Registrations': 'Inscriptions SAGICAM',
  'Sponsor Profile': 'Profil du sponsor',
  'Transaction History': 'Historique des transactions',
  'Users Contacts': 'Contacts des utilisateurs'
}

export const translateDashboardMenuLabel = (label: string, language: AppLanguage) => {
  if (language !== 'fr') return label

  const normalizedLabel = label.trim()

  return dashboardMenuLabelTranslations[normalizedLabel] ?? label
}

const translateDashboardMenuSubItem = (item: MenuSubItem, language: AppLanguage): MenuSubItem => ({
  ...item,
  label: translateDashboardMenuLabel(item.label, language)
})

export const translateDashboardMenuItems = (items: MenuItem[], language: AppLanguage): MenuItem[] =>
  items.map(item =>
    item.children
      ? {
          ...item,
          label: translateDashboardMenuLabel(item.label, language),
          children: item.children.map(child => translateDashboardMenuSubItem(child, language))
        }
      : {
          ...item,
          label: translateDashboardMenuLabel(item.label, language)
        }
  )

export const memberStatusLabels: Record<AppLanguage, Record<memberStatus, string>> = {
  en: {
    [memberStatus.Pending]: 'Pending',
    [memberStatus.Awaiting]: 'Awaiting Publication',
    [memberStatus.Vested]: 'Vested',
    [memberStatus.Delinquent]: 'Not in Good Standing'
  },
  fr: {
    [memberStatus.Pending]: 'En attente',
    [memberStatus.Awaiting]: 'En attente de publication',
    [memberStatus.Vested]: 'Acquis',
    [memberStatus.Delinquent]: 'Pas en règle'
  }
}

export const contributionStatusLabels: Record<AppLanguage, Record<contributionStatus, string>> = {
  en: {
    [contributionStatus.review]: 'Case In Review',
    [contributionStatus.denied]: 'Contribution Denied',
    [contributionStatus.underway]: 'Contribution Underway',
    [contributionStatus.completed]: 'Contribution Completed'
  },
  fr: {
    [contributionStatus.review]: 'Dossier en révision',
    [contributionStatus.denied]: 'Cotisation refusée',
    [contributionStatus.underway]: 'Cotisation en cours',
    [contributionStatus.completed]: 'Cotisation terminée'
  }
}

export const deceasedMemberDocumentStatusLabelsByLanguage: Record<
  AppLanguage,
  Record<DeceasedMemberDocumentStatus, string>
> = {
  en: deceasedMemberDocumentStatusLabels,
  fr: {
    approved: 'Approuvé',
    rejected: 'Rejeté',
    submitted: 'Soumis'
  }
}

export const nameChangeRequestStatusLabelsByLanguage: Record<AppLanguage, Record<NameChangeRequestStatus, string>> = {
  en: nameChangeRequestStatusLabels,
  fr: {
    approved: 'Approuvé',
    documentation_requested: 'Documents demandés',
    rejected: 'Rejeté',
    submitted: 'Soumis'
  }
}

export const memberTransferRequestStatusLabelsByLanguage: Record<
  AppLanguage,
  Record<MemberTransferRequestStatus, string>
> = {
  en: memberTransferRequestStatusLabels,
  fr: {
    admin_approved: "Approuvé par l'admin",
    admin_rejected: "Rejeté par l'admin",
    cancelled: 'Annulé',
    receiving_sponsor_approved: 'Libération approuvée par le sponsor receveur',
    receiving_sponsor_pending: 'Libération en attente du sponsor receveur',
    receiving_sponsor_rejected: 'Libération rejetée par le sponsor receveur'
  }
}

export const formatMemberStatus = (status: string | null | undefined, language: AppLanguage) =>
  status && Object.values(memberStatus).includes(status as memberStatus)
    ? memberStatusLabels[language][status as memberStatus]
    : (status ?? '')

export const formatContributionStatus = (status: string | null | undefined, language: AppLanguage) =>
  status && Object.values(contributionStatus).includes(status as contributionStatus)
    ? contributionStatusLabels[language][status as contributionStatus]
    : (status ?? '')

export const formatDeceasedMemberDocumentStatus = (status: string, language: AppLanguage) =>
  deceasedMemberDocumentStatuses.includes(status as DeceasedMemberDocumentStatus)
    ? deceasedMemberDocumentStatusLabelsByLanguage[language][status as DeceasedMemberDocumentStatus]
    : status

export const formatNameChangeRequestStatus = (status: string, language: AppLanguage) =>
  nameChangeRequestStatuses.includes(status as NameChangeRequestStatus)
    ? nameChangeRequestStatusLabelsByLanguage[language][status as NameChangeRequestStatus]
    : status

export const formatMemberTransferRequestStatus = (status: string, language: AppLanguage) =>
  memberTransferRequestStatuses.includes(status as MemberTransferRequestStatus)
    ? memberTransferRequestStatusLabelsByLanguage[language][status as MemberTransferRequestStatus]
    : status
