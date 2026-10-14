/** Validação de CPF e CNPJ (inclui o CNPJ alfanumérico, vigente desde julho/2026). */

export function cleanDocument(value) {
  return String(value || '').toUpperCase().replace(/[^0-9A-Z]/g, '')
}

export function isValidCPF(value) {
  const cpf = String(value || '').replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  const calc = (len) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10])
}

export function isValidCNPJ(value) {
  const cnpj = cleanDocument(value)
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(cnpj)) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false
  // Cada caractere vale (código ASCII - 48): dígitos 0-9, letras A=17 ... Z=42
  const values = [...cnpj].map((c) => c.charCodeAt(0) - 48)
  const calc = (len) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum = 0
    for (let i = 0; i < len; i++) sum += values[i] * weights[i]
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }
  return calc(12) === values[12] && calc(13) === values[13]
}

/** Retorna '' se válido (ou vazio) ou a mensagem de erro. */
export function validateDocument(value) {
  const doc = cleanDocument(value)
  if (!doc) return ''
  if (doc.length === 11 && /^\d+$/.test(doc)) return isValidCPF(doc) ? '' : 'CPF inválido'
  if (doc.length === 14) return isValidCNPJ(doc) ? '' : 'CNPJ inválido'
  return 'Informe um CPF (11 dígitos) ou CNPJ (14 caracteres)'
}
