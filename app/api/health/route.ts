import { connectDB } from '@/lib/mongodb'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await connectDB()
    return NextResponse.json({ status: 'ok' })
  } catch (e) {
    return NextResponse.json({ status: 'error', message: String(e) }, { status: 500 })
  }
}
