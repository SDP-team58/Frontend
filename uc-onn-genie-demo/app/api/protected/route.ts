import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/getServerUser'

export async function GET(req: Request) {
  const user = await getServerUser(req)
  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'unauthenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return NextResponse.json({ authenticated: true, user })
}
