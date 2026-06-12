import { Clock, FileClock, ShieldCheck, UsersRound, WalletCards } from 'lucide-react'

type MembershipSummaryCardsProps = {
  awaiting: number
  delinquent: number
  pending: number
  total: number
  vested: number
}

const summaryCards = [
  {
    key: 'vested',
    label: 'All vested',
    icon: ShieldCheck,
    className: 'border-green-600/20 bg-green-600/5 text-green-700 dark:text-green-400'
  },
  {
    key: 'awaiting',
    label: 'All Awaiting',
    icon: FileClock,
    className: 'border-blue-600/20 bg-blue-600/5 text-blue-700 dark:text-blue-400'
  },
  {
    key: 'pending',
    label: 'All Pending',
    icon: Clock,
    className: 'border-amber-600/20 bg-amber-600/5 text-amber-700 dark:text-amber-400'
  },
  {
    key: 'delinquent',
    label: 'All Delinquents',
    icon: WalletCards,
    className: 'border-red-600/20 bg-red-600/5 text-red-700 dark:text-red-400'
  },
  {
    key: 'total',
    label: 'All Membership',
    icon: UsersRound,
    className: 'border-primary/20 bg-primary/5 text-primary'
  }
] as const

const MembershipSummaryCards = ({ awaiting, delinquent, pending, total, vested }: MembershipSummaryCardsProps) => {
  const counts = {
    awaiting,
    delinquent,
    pending,
    total,
    vested
  }

  return (
    <div className='grid w-full grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
      {summaryCards.map(card => {
        const Icon = card.icon

        return (
          <div key={card.key} className={`min-w-0 rounded-lg border p-3 sm:p-4 ${card.className}`}>
            <div className='flex items-center justify-between gap-3'>
              <p className='min-w-0 text-xs font-semibold tracking-normal break-words uppercase'>{card.label}</p>
              <Icon className='size-5 shrink-0' />
            </div>
            <p className='mt-3 text-2xl font-bold tabular-nums sm:text-3xl'>{counts[card.key].toLocaleString()}</p>
          </div>
        )
      })}
    </div>
  )
}

export default MembershipSummaryCards
