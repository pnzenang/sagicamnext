import { BookCheck, Cross, Navigation, SquareUser, Trash2, UserCog, UserPlus, Users, Wallet } from 'lucide-react'

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
    label: 'All Members',
    href: '/all-members'
  },
  {
    icon: Wallet,
    label: 'Contributions',
    href: '/contributions'
  },
  {
    icon: Trash2,
    label: 'Removed Members',
    href: '/removed-members'
  },
  {
    icon: Cross,
    label: 'Deceased Members',
    href: '/deceased-members'
  },
  {
    icon: SquareUser,
    label: 'Profile',
    href: '/profile'
  },
  {
    icon: UserCog,
    label: 'Admin',
    href: '/admin'
  }
]
