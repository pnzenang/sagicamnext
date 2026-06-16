import { CircleCheckBig, CircleDollarSign, ClipboardClock, HandCoins, UsersRound } from 'lucide-react'

type DeceasedSummaryCardsProps = {
  completed: number
  denied: number
  inReview: number
  total: number
  underway: number
}

const summaryCards = [
  {
    key: 'completed',
    label: 'Case(s) completed',
    icon: CircleCheckBig,
    className: 'border-green-600/20 bg-green-600/5 text-green-700 dark:text-green-400'
  },
  {
    key: 'underway',
    label: 'Case(s) underway',
    icon: HandCoins,
    className: 'border-blue-600/20 bg-blue-600/5 text-blue-700 dark:text-blue-400'
  },
  {
    key: 'inReview',
    label: 'Case(s) in review',
    icon: ClipboardClock,
    className: 'border-amber-600/20 bg-amber-600/5 text-amber-700 dark:text-amber-400'
  },
  {
    key: 'denied',
    label: 'Case(s) denied',
    icon: CircleDollarSign,
    className: 'border-red-600/20 bg-red-600/5 text-red-700 dark:text-red-400'
  },
  {
    key: 'total',
    label: 'All deceased',
    icon: UsersRound,
    className: 'border-primary/20 bg-primary/5 text-primary'
  }
] as const

const DeceasedSummaryCards = ({ completed, denied, inReview, total, underway }: DeceasedSummaryCardsProps) => {
  const counts = {
    completed,
    denied,
    inReview,
    total,
    underway
  }

  return (
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
      {summaryCards.map(card => {
        const Icon = card.icon

        return (
          <div key={card.key} className={`min-w-0 rounded-lg border p-3 sm:p-4 ${card.className}`}>
            <div className='flex items-center justify-between gap-3'>
              <p className='text-xs font-semibold tracking-normal uppercase'>{card.label}</p>
              <Icon className='size-5 shrink-0' />
            </div>
            <p className='mt-3 text-3xl font-bold'>{counts[card.key].toLocaleString()}</p>
          </div>
        )
      })}
    </div>
  )
}

export type DeceasedSummary = DeceasedSummaryCardsProps
export default DeceasedSummaryCards
