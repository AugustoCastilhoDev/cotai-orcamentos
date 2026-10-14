import { db } from '@/db'
import { todayISO } from '@/utils/format'
import { downloadBlob } from './useShare'

const APP_ID = 'cotai'
const BACKUP_VERSION = 1

export async function exportBackup() {
  const [settings, clients, catalog, quotes] = await Promise.all([
    db.settings.toArray(),
    db.clients.toArray(),
    db.catalog.toArray(),
    db.quotes.toArray()
  ])
  const payload = {
    app: APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: { settings, clients, catalog, quotes }
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `backup-cotai-${todayISO()}.json`)
  return { clients: clients.length, catalog: catalog.length, quotes: quotes.length }
}

/** Lê e valida o arquivo. Lança erro com mensagem amigável se for inválido. */
export async function readBackupFile(file) {
  let parsed
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    throw new Error('O arquivo não é um JSON válido.')
  }
  const data = parsed?.data
  if (parsed?.app !== APP_ID || !data) throw new Error('Este arquivo não é um backup deste aplicativo.')
  for (const key of ['settings', 'clients', 'catalog', 'quotes']) {
    if (!Array.isArray(data[key])) throw new Error(`Backup incompleto: falta a lista "${key}".`)
  }
  if (data.settings.some((s) => typeof s?.key !== 'string')) throw new Error('Backup com configurações inválidas.')
  for (const key of ['clients', 'catalog', 'quotes']) {
    if (data[key].some((r) => typeof r !== 'object' || r === null || typeof r.id !== 'number')) {
      throw new Error(`Backup com registros inválidos em "${key}".`)
    }
  }
  return {
    exportedAt: parsed.exportedAt,
    data,
    counts: { clients: data.clients.length, catalog: data.catalog.length, quotes: data.quotes.length }
  }
}

/** Substitui todos os dados locais pelos do backup. */
export async function restoreBackup(data) {
  await db.transaction('rw', db.settings, db.clients, db.catalog, db.quotes, async () => {
    await Promise.all([db.settings.clear(), db.clients.clear(), db.catalog.clear(), db.quotes.clear()])
    await db.settings.bulkPut(data.settings)
    await db.clients.bulkPut(data.clients)
    await db.catalog.bulkPut(data.catalog)
    await db.quotes.bulkPut(data.quotes)
  })
}
