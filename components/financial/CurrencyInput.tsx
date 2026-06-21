'use client'
import { useState } from 'react'

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'type' | 'onChange'> {
  name: string
  initialCents?: number
}

export function CurrencyInput({ name, initialCents = 0, className, ...props }: Props) {
  const [cents, setCents] = useState(initialCents)

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      setCents(prev => Math.floor(prev / 10))
      return
    }
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      const digit = parseInt(e.key, 10)
      setCents(prev => {
        const next = prev * 10 + digit
        return next > 999999999 ? prev : next // max R$ 9.999.999,99
      })
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '')
    if (digits) {
      const n = parseInt(digits, 10)
      if (n <= 999999999) setCents(n)
    }
  }

  const display = (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <>
      <input type="hidden" name={name} value={(cents / 100).toFixed(2)} />
      <input
        {...props}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={className}
      />
    </>
  )
}
