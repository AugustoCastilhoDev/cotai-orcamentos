import { validateDocument } from './documents.js'
import { onlyDigits } from './format.js'

export function validateEmail(value) {
  const v = String(value || '').trim()
  if (!v) return ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'E-mail inválido'
}

export function validatePhone(value) {
  const d = onlyDigits(value)
  if (!d) return ''
  return d.length === 10 || d.length === 11 ? '' : 'Telefone deve ter DDD + número'
}

export function validateRequired(value, label = 'Campo') {
  return String(value ?? '').trim() ? '' : `${label} é obrigatório`
}

/** Valida os campos de contato comuns a cliente e empresa. */
export function validateContact(data, { nameLabel = 'Nome' } = {}) {
  const errors = {
    name: validateRequired(data.name, nameLabel),
    phone: validatePhone(data.phone),
    email: validateEmail(data.email),
    document: validateDocument(data.document)
  }
  Object.keys(errors).forEach((k) => !errors[k] && delete errors[k])
  return errors
}
