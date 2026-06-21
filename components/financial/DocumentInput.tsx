'use client'
import { useState } from 'react'

function applyMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  defaultValue?: string
}

export function DocumentInput({ defaultValue = '', className, ...props }: Props) {
  const [value, setValue] = useState(applyMask(defaultValue))

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(applyMask(e.target.value))}
      placeholder="CPF ou CNPJ"
      className={className}
    />
  )
}
