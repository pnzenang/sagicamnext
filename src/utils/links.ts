import {
  BookCheck,
  CreditCard,
  Cross,
  Megaphone,
  MessageCircle,
  SquareUser,
  Trash2,
  UserCog,
  UserMinus,
  UserPlus,
  FileStack,
  Users,
  Wallet,
  FileCheck,
  WalletCards,
  WalletMinimal,
  History,
  List,
  ArrowLeftRight,
  Calculator,
  Table2
} from 'lucide-react'

import type { MenuItem } from './types'

export const pagesItems: MenuItem[] = [
  {
    icon: MessageCircle,
    label: 'Join WhatsApp Group',
    href: '/navigation-instructions'
  },
  {
    icon: BookCheck,
    label: 'Internal Rules At Glance',
    href: '/internal-rules'
  },

  {
    icon: UserPlus,
    label: 'Add Loved One',
    href: '/add-member'
  },
  {
    icon: Users,
    label: 'All Loved Ones',
    href: '/all-members'
  },
  {
    icon: WalletMinimal,
    label: 'Registration Payments  ',
    href: '/registration-payments'
  },

  {
    icon: WalletCards,
    label: 'Contributions Payments',
    href: '/contributions-payments'
  },
  {
    icon: Table2,
    label: 'Contribution Table',
    href: '/contribution-table'
  },
  {
    icon: CreditCard,
    label: 'Payment Instructions',
    href: '/payment-instructions'
  },
  {
    icon: UserMinus,
    label: 'Remove Member',
    href: '/remove-member'
  },
  {
    icon: Trash2,
    label: 'All Removed Loved Ones',
    href: '/removed-members'
  },
  {
    icon: Megaphone,
    label: 'Death Announcement',
    href: '/death-announcement'
  },
  {
    icon: Cross,
    label: 'All Deceased Loved Ones',
    href: '/deceased-members'
  },
  {
    icon: List,
    label: 'New Additions  ',
    href: '/new-additions'
  },

  // {
  //   icon: Wallet,
  //   label: 'Sponsor Financial Position.',
  //   href: '/contributions-recap'
  // },

  {
    icon: FileStack,
    label: 'Death Documentations',
    href: '/death-documentations'
  },
  {
    icon: FileCheck,
    label: 'Name Change & Documentations',
    href: '/name-change-documents-upload'
  },
  {
    icon: ArrowLeftRight,
    label: 'Member Transfer',
    href: '/member-transfer'
  },
  {
    icon: SquareUser,
    label: 'Sponsor Profile',
    href: '/profile'
  },
  {
    icon: UserCog,
    label: 'Admin',
    children: [
      {
        icon: UserCog,
        label: 'Admin Members',
        href: '/admin-members'
      },
      {
        icon: FileCheck,
        label: 'Admin Name Changes',
        href: '/admin-name-changes'
      },
      {
        icon: ArrowLeftRight,
        label: 'Admin Member Transfers',
        href: '/admin-member-transfers'
      },
      {
        icon: UserCog,
        label: 'Admin Removed',
        href: '/admin-removed'
      },
      {
        icon: UserCog,
        label: 'Admin Deceased',
        href: '/admin-deceased'
      },
      {
        icon: FileStack,
        label: 'Admin Death Documentations',
        href: '/admin-death-documentations'
      },
      {
        icon: UserCog,
        label: 'Admin Count',
        href: '/admin-count'
      },
      {
        icon: SquareUser,
        label: 'Users Contacts',
        href: '/admin-users-contacts'
      },
      {
        icon: Calculator,
        label: 'Contribution Calculation',
        href: '/admin-contribution-calculation'
      },
      {
        icon: Table2,
        label: 'Payment Update',
        href: '/admin-payment-update'
      },
      {
        icon: WalletCards,
        label: 'Sagicam Contributions',
        href: '/admin-sagicam-payments'
      },
      {
        icon: WalletCards,
        label: 'Sagicam Registrations',
        href: '/admin-sagicam-registrations'
      },
      {
        icon: History,
        label: 'Transaction History',
        href: '/admin-payment-history'
      }
    ]
  }
]
