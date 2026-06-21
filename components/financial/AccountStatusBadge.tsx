interface Props {
  status: 'open' | 'paid' | 'cancelled'
  overdue?: boolean
}

const variants = {
  paid:      'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
  overdue:   'bg-red-100 text-red-700',
  open:      'bg-amber-100 text-amber-700',
}

const labels = {
  paid:      'Paga',
  cancelled: 'Cancelada',
  overdue:   'Vencida',
  open:      'Em aberto',
}

export function AccountStatusBadge({ status, overdue }: Props) {
  const key = status === 'open' && overdue ? 'overdue' : status
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[key]}`}>
      {labels[key]}
    </span>
  )
}
