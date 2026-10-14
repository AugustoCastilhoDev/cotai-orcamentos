/**
 * Geração de payload Pix "copia e cola" (BR Code estático) conforme o
 * Manual de Padrões para Iniciação do Pix (EMV QRCPS-MPM).
 */

/** Remove acentos e caracteres fora do conjunto permitido. */
export function sanitizePixText(text, maxLength) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 .,\-/@*]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

/** Monta um campo EMV: ID (2) + tamanho (2) + valor. */
function field(id, value) {
  const len = String(value.length).padStart(2, '0')
  return `${id}${len}${value}`
}

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), em hexadecimal maiúsculo. */
export function crc16(payload) {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/** Normaliza a chave: telefone ganha +55, CPF/CNPJ fica só com dígitos. */
export function normalizePixKey(key) {
  const k = String(key || '').trim()
  if (!k) return ''
  if (k.includes('@')) return k.toLowerCase()
  // chave aleatória (EVP)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k)) return k.toLowerCase()
  if (k.startsWith('+')) return '+' + k.replace(/\D/g, '')
  return k.replace(/[.\-/\s()]/g, '')
}

/**
 * Gera o payload BR Code.
 * @param {{key:string, name:string, city:string, description?:string, amount?:number, txid?:string}} opts
 */
export function buildPixPayload({ key, name, city, description = '', amount = 0, txid = '***' }) {
  const gui = field('00', 'br.gov.bcb.pix')
  const keyField = field('01', normalizePixKey(key))
  const maxDesc = 99 - gui.length - keyField.length - 4
  const desc = sanitizePixText(description, Math.max(0, maxDesc))
  const merchantAccount = gui + keyField + (desc ? field('02', desc) : '')

  let payload =
    field('00', '01') +
    field('26', merchantAccount) +
    field('52', '0000') +
    field('53', '986') +
    (amount > 0 ? field('54', amount.toFixed(2)) : '') +
    field('58', 'BR') +
    field('59', sanitizePixText(name, 25) || 'RECEBEDOR') +
    field('60', sanitizePixText(city, 15) || 'BRASIL') +
    field('62', field('05', sanitizePixText(txid, 25) || '***'))

  payload += '6304'
  return payload + crc16(payload)
}
