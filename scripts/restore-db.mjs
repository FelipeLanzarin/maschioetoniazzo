// Restaura um backup feito por backup-db.mjs.
//
// Uso (dentro de sistema/):
//   npm run db:restore -- <pasta-do-backup>                          -> simulação (não altera nada)
//   npm run db:restore -- <pasta-do-backup> --yes                    -> restaura no banco do MONGODB_URI (dev)
//   npm run db:restore -- <pasta-do-backup> --db maschioetoniazzo --yes   -> restaura em outro banco (ex.: produção)
//
// Antes de restaurar, um backup de segurança do banco alvo é feito automaticamente
// (pasta com sufixo _pre-restore). Collections do backup são substituídas por completo;
// collections que existem no banco mas não no backup não são tocadas.
import path from 'node:path'
import { parseArgs, connect, readBackup, backupDatabase, restoreDatabase, currentCounts } from './db-backup-lib.mjs'

const args = parseArgs(process.argv.slice(2))
const dirArg = args._[0]
if (!dirArg) {
  console.error('Uso: npm run db:restore -- <pasta-do-backup> [--db <banco>] [--yes]')
  process.exit(1)
}

const backup = readBackup(path.resolve(dirArg))
const client = await connect()
try {
  const dbName = typeof args.db === 'string' ? args.db : undefined
  const target = client.db(dbName).databaseName
  const before = await currentCounts(client, dbName)

  console.log(`Backup:  ${backup.manifest.database} @ ${backup.manifest.createdAt}`)
  console.log(`Destino: ${target}\n`)
  console.log('Collection'.padEnd(20), 'atual'.padStart(8), '→', 'backup'.padStart(8))
  for (const [name, info] of Object.entries(backup.manifest.collections))
    console.log(name.padEnd(20), String(before[name] ?? 0).padStart(8), '→', String(info.count).padStart(8))
  const untouched = Object.keys(before).filter((n) => !(n in backup.manifest.collections))
  if (untouched.length) console.log(`\nNão serão alteradas: ${untouched.join(', ')}`)

  if (!args.yes) {
    console.log('\nSimulação apenas. Adicione --yes para restaurar.')
  } else {
    console.log('\nBackup de segurança do destino antes de restaurar...')
    const safety = await backupDatabase(client, dbName, { label: 'pre-restore' })
    console.log(`  salvo em: ${safety}\n\nRestaurando...`)
    await restoreDatabase(client, dbName, backup)
    console.log('\nRestauração concluída.')
  }
} catch (e) {
  console.error('Erro na restauração:', e.message)
  process.exitCode = 1
} finally {
  await client.close()
}
