/** Normaliza texto para busca: minúsculas e sem acentos. */
export function normalizeSearch(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
