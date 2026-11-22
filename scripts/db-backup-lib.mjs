import { MongoClient } from 'mongodb'
import { EJSON } from 'bson'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Backups ficam FORA do repositório git: C:\Projetos\maschioetoniazzo\backups
export const BACKUP_ROOT = path.resolve(__dirname, '..', '..', 'backups')

export function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = argv[i + 1]
      if (next !== undefined && !next.startsWith('--')) { args[key] = next; i++ }
      else args[key] = true
    } else args._.push(a)
  }
  return args
}

export async function connect() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI não definida (rode com --env-file=.env.local).')
  const client = new MongoClient(uri)
  await client.connect()
  return client
}

function timestamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`
}

async function listUserCollections(db) {
  const cols = await db.listCollections({}, { nameOnly: false }).toArray()
  return cols
    .filter((c) => c.type === 'collection' && !c.name.startsWith('system.'))
    .map((c) => c.name)
    .sort()
}

/** Faz backup de todas as collections do banco `dbName`. Retorna a pasta criada. */
export async function backupDatabase(client, dbName, { label } = {}) {
  const db = client.db(dbName)
  const dir = path.join(BACKUP_ROOT, db.databaseName, timestamp() + (label ? `_${label}` : ''))
  fs.mkdirSync(dir, { recursive: true })

  const manifest = { database: db.databaseName, createdAt: new Date().toISOString(), collections: {} }

  for (const name of await listUserCollections(db)) {
    const col = db.collection(name)
    const docs = await col.find({}).toArray()
    const indexes = await col.indexes()
    fs.writeFileSync(path.join(dir, `${name}.json`), EJSON.stringify(docs, { relaxed: false }))
    manifest.collections[name] = { count: docs.length, indexes }
    console.log(`  ✓ ${name}: ${docs.length} documentos`)
  }

  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2))
  return dir
}

/** Lê um backup do disco. */
export function readBackup(dir) {
  const manifestPath = path.join(dir, 'manifest.json')
  if (!fs.existsSync(manifestPath)) throw new Error(`manifest.json não encontrado em ${dir}`)
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const data = {}
  for (const name of Object.keys(manifest.collections)) {
    const docs = EJSON.parse(fs.readFileSync(path.join(dir, `${name}.json`), 'utf8'), { relaxed: false })
    if (docs.length !== manifest.collections[name].count)
      throw new Error(`Backup corrompido: ${name}.json tem ${docs.length} docs, manifest diz ${manifest.collections[name].count}`)
    data[name] = docs
  }
  return { manifest, data }
}

/** Substitui cada collection do backup no banco alvo (drop + índices + insert). */
export async function restoreDatabase(client, dbName, { manifest, data }) {
  const db = client.db(dbName)
  for (const [name, docs] of Object.entries(data)) {
    const existing = await db.listCollections({ name }).toArray()
    if (existing.length) await db.collection(name).drop()
    await db.createCollection(name)
    const col = db.collection(name)

    for (const idx of manifest.collections[name].indexes) {
      if (idx.name === '_id_') continue
      const { key, v, ns, ...options } = idx
      await col.createIndex(key, options)
    }

    for (let i = 0; i < docs.length; i += 500) {
      await col.insertMany(docs.slice(i, i + 500), { ordered: true })
    }

    const count = await col.countDocuments()
    if (count !== docs.length) throw new Error(`${name}: esperado ${docs.length}, inserido ${count}`)
    console.log(`  ✓ ${name}: ${count} documentos restaurados`)
  }
}

export async function currentCounts(client, dbName) {
  const db = client.db(dbName)
  const out = {}
  for (const name of await listUserCollections(db)) out[name] = await db.collection(name).countDocuments()
  return out
}
