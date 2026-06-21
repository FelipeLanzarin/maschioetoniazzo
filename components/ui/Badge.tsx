type Variant = 'green' | 'red' | 'amber' | 'gray' | 'indigo'

const variants: Record<Variant, string> = {
  green: 'bg-green-50 text-green-700 ring-green-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  gray: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
}

interface Props {
  label: string
  variant: Variant
}

export function Badge({ label, variant }: Props) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant]}`}>
      {label}
    </span>
  )
}
