import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const [name, password] = process.argv.slice(2)

if (!name || !password) {
  console.error('Uso: npx ts-node scripts/create-user.ts <nome> <senha>')
  process.exit(1)
}

const MONGODB_URI = process.env.MONGODB_URI!

async function main() {
  await mongoose.connect(MONGODB_URI)

  const UserSchema = new mongoose.Schema({ name: String, password: String }, { timestamps: true })
  const User = mongoose.models.User || mongoose.model('User', UserSchema)

  const existing = await User.findOne({ name })
  if (existing) {
    console.error(`Usuário "${name}" já existe.`)
    process.exit(1)
  }

  const hash = await bcrypt.hash(password, 10)
  await User.create({ name, password: hash })
  console.log(`Usuário "${name}" criado com sucesso.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
