import { cleanDocument } from './documents.js'

/** Aplica um padrão onde "#" é um caractere da entrada. */
function applyPattern(chars, pattern) {
  let out = ''
  let i = 0
  for (const p of pattern) {
    if (i >= chars.length) break
    if (p === '#') out += chars[i++]
    else out += p
  }
  return out
}

export function maskPhone(value) {
  const d = String(value || '').replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return applyPattern(d, '(##) ####')
  if (d.length <= 10) return applyPattern(d, '(##) ####-####')
  return applyPattern(d, '(##) #####-####')
}

/** CPF ou CNPJ (numérico ou alfanumérico), decidido pelo conteúdo. */
export function maskDocument(value) {
  const c = cleanDocument(value).slice(0, 14)
  const isCpf = c.length <= 11 && /^\d*$/.test(c)
  if (isCpf) return applyPattern(c, '###.###.###-##')
  return applyPattern(c, '##.###.###/####-##')
}

export function maskCep(value) {
  return applyPattern(String(value || '').replace(/\D/g, '').slice(0, 8), '#####-###')
}

export const masks = {
  phone: maskPhone,
  document: maskDocument,
  cep: maskCep
}
