import { NextResponse } from 'next/server'
import { CAS_BASE } from '@/lib/config'

// Server-side logout handler:
// - Clears the local `auth` cookie (HttpOnly) issued by the app.
// - Redirects the browser to the CAS logout endpoint so the SSO session is terminated.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const origin = url.origin

  // Build CAS logout URL. CAS typically supports a `service` param to return
  // the user after logout; use the app root as the return target.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const service = `${baseUrl}/` // return target after CAS logout
  const logoutUrl = `${CAS_BASE}/logout?service=${encodeURIComponent(service)}`

  const res = NextResponse.redirect(new URL(logoutUrl))

  // Clear the `auth` cookie by setting an empty value and maxAge=0.
  res.cookies.set('auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return res
}
