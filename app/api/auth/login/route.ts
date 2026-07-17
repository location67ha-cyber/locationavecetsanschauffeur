import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin2024!'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const cookieStore = cookies()
    cookieStore.set('admin_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24h
      path: '/',
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, message: 'Identifiants incorrects' }, { status: 401 })
}

export async function DELETE() {
  const cookieStore = cookies()
  cookieStore.delete('admin_auth')
  return NextResponse.json({ success: true })
}
