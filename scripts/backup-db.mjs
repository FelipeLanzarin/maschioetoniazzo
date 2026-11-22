// Backup completo do banco MongoDB.
//
// Uso (dentro de sistema/):
//   npm run db:backup                       -> banco do MONGODB_URI (dev)
//   npm run db:backup -- --db maschioetoniazzo   -> outro banco no mesmo cluster (ex.: produção)
//
// Saída: C:\Projetos\maschioetoniazzo\backups\<banco>\<data_hora>\
//   manifest.json + um <collection>.json (EJSON) por collection.
import { parseArgs, connect, backupDatabase } from './db-backup-lib.mjs'

const args = parseArgs(process.argv.slice(2))
const client = await connect()
try {
  const dbName = typeof args.db === 'string' ? args.db : undefined
  const name = client.db(dbName).databaseName
  console.log(`Backup do banco "${name}"...`)
  const dir = await backupDatabase(client, dbName, { label: typeof args.label === 'string' ? args.label : undefined })
  console.log(`\nBackup salvo em: ${dir}`)
} catch (e) {
  console.error('Erro no backup:', e.message)
  process.exitCode = 1
} finally {
  await client.close()
}
