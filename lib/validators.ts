export function validateCPF(cpf: string): boolean {
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(n[i]) * (10 - i)
  let rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  if (rem !== parseInt(n[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(n[i]) * (11 - i)
  rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  return rem === parseInt(n[10])
}

export function validateCNPJ(cnpj: string): boolean {
  const n = cnpj.replace(/\D/g, '')
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) sum += parseInt(n[i]) * w1[i]
  let rem = sum % 11
  const d1 = rem < 2 ? 0 : 11 - rem
  if (d1 !== parseInt(n[12])) return false
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) sum += parseInt(n[i]) * w2[i]
  rem = sum % 11
  const d2 = rem < 2 ? 0 : 11 - rem
  return d2 === parseInt(n[13])
}

export function validateDocument(doc: string): boolean {
  const digits = doc.replace(/\D/g, '')
  if (digits.length === 11) return validateCPF(digits)
  if (digits.length === 14) return validateCNPJ(digits)
  return false
}
