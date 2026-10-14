import Dexie from 'dexie'

/**
 * Banco local (IndexedDB). Nada é enviado para servidores.
 *  - settings: pares chave/valor (dados da empresa, contadores de numeração)
 *  - clients, catalog, quotes: registros com id autoincremental
 */
export const db = new Dexie('cotai')

db.version(1).stores({
  settings: 'key',
  clients: '++id, name, createdAt',
  catalog: '++id, description, kind',
  quotes: '++id, &number, status, date, updatedAt'
})

/** Converte proxies reativos do Vue em objetos simples (IndexedDB não aceita proxies). */
export function plain(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/** Pede ao navegador para não apagar os dados em caso de pouco espaço. */
export async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist()
    }
  } catch {
    /* sem suporte: segue normalmente */
  }
}
