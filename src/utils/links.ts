import {
  BookCheck,
  Cross,
  Navigation,
  SquareUser,
  Trash2,
  UserCog,
  UserPlus,
  FileStack,
  Users,
  Wallet,
  FileCheck,
  WalletCards,
  WalletMinimal
} from 'lucide-react'

import type { MenuItem } from './types'

export const pagesItems: MenuItem[] = [
  {
    icon: Navigation,
    label: 'Navigation Instructions',
    href: '/navigation-instructions'
  },
  {
    icon: BookCheck,
    label: 'Internal Rules At Glance',
    href: '/internal-rules'
  },

  {
    icon: UserPlus,
    label: 'Add Member',
    href: '/add-member'
  },
  {
    icon: Users,
    label: 'All Active Members',
    href: '/all-members'
  },
  {
    icon: Trash2,
    label: 'All Removed Members',
    href: '/removed-members'
  },
  {
    icon: Cross,
    label: 'All Deceased Members',
    href: '/deceased-members'
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
    icon: Wallet,
    label: 'Contributions Recap.',
    href: '/contributions-recap'
  },

  {
    icon: FileStack,
    label: 'Death Documentations',
    href: '/documents-upload'
  },
  {
    icon: FileCheck,
    label: 'Name Change & Documentations',
    href: '/name-change-documents-upload'
  },
  {
    icon: FileCheck,
    label: 'Payment Instructions',
    href: '/payment-instructions'
  },
  {
    icon: SquareUser,
    label: 'Profile',
    href: '/profile'
  },
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
  }
]
