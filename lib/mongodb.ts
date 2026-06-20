import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) throw new Error('MONGODB_URI não definida no .env.local')

let cached = (global as any).mongoose || { conn: null, promise: null }
;(global as any).mongoose = cached

export async function connectDB() {
  if (cached.conn) return cached.conn
  cached.promise = cached.promise || mongoose.connect(MONGODB_URI)
  cached.conn = await cached.promise
  return cached.conn
}
