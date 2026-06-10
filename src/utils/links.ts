import {
  BookCheck,
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
  CreditCard,
  List,
  Table
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
    icon: Users,
    label: 'Loved Ones',
    children: [
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
        icon: Cross,
        label: 'All Deceased Loved Ones',
        href: '/deceased-members'
      },
      {
        icon: Megaphone,
        label: 'Death Announcement',
        href: '/death-announcement'
      }
    ]
  },
  {
    icon: List,
    label: 'New Additions  ',
    href: '/new-additions'
  },
  {
    icon: WalletMinimal,
    label: 'Registration Payments  ',
    href: '/registration-payments'
  },
  {
    icon: Table,
    label: 'Contribution Table',
    href: '/contribution-table'
  },

  // {
  //   icon: WalletCards,
  //   label: 'Contributions Payments',
  //   href: '/contributions-payments'
  // },
  {
    icon: Wallet,
    label: 'Sponsor Financial Position.',
    href: '/contributions-recap'
  },

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
    icon: CreditCard,
    label: 'Payment Instructions',
    href: '/payment-instructions'
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
        icon: UserCog,
        label: 'Admin Count',
        href: '/admin-count'
      },
      {
        icon: WalletCards,
        label: 'Sagicam Payments',
        href: '/admin-sagicam-payments'
      }
    ]
  }
]
