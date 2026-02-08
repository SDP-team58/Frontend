import { NextResponse } from 'next/server'
import { signAuthToken } from '@/lib/auth'
import { CAS_BASE } from '@/lib/config'

// Server-side CAS callback handler
// Assumptions (documented):
// - This code runs on the server (Next.js Route Handler under app/api).
// - `process.env.JWT_SECRET` must be set to sign session tokens.

export async function GET(req: Request) {
  const url = new URL(req.url)
  const ticket = url.searchParams.get('ticket')

  if (!ticket) {
    return NextResponse.redirect(new URL('/?auth=missing_ticket', url))
  }

  // Compute the service from the incoming request URL (without querystring).
  // Using the exact request path ensures it matches the `service` used when
  // CAS issued the ticket. Mismatched service strings are the most common
  // reason for `INVALID_TICKET` from CAS.
  const service = `${url.origin}${url.pathname}`

  // Use the fixed CAS base URL from server config.
  const encodedService = encodeURIComponent(service)
  const validateUrl = `${CAS_BASE}/serviceValidate?service=${encodedService}&ticket=${encodeURIComponent(
    ticket
  )}`

  let resText = ''
  try {
    console.log(`Validating CAS ticket at: ${validateUrl}`)
    console.log(`Service (raw): ${service}`)
    console.log(`Service (encoded): ${encodedService}`)
    const r = await fetch(validateUrl)
    resText = await r.text()
    console.log(`CAS response: ${resText}`)
  } catch (e) {
    console.error('Error fetching CAS validation:', e)
    return NextResponse.redirect(new URL(`/?auth=error_fetching_cas`, url))
  }

  // Simple XML parse to extract username from CAS response
  // Expected success response contains: <cas:authenticationSuccess>...<cas:user>USERNAME</cas:user>
  const userMatch = resText.match(/<cas:user[^>]*>([^<]+)<\/cas:user>/i)
  if (!userMatch) {
    // Authentication failed or invalid ticket
    return NextResponse.redirect(new URL('/?auth=invalid_ticket', url))
  }

  const username = userMatch[1]

  // Create JWT and set as HttpOnly cookie
  const token = signAuthToken({ user: username })

  const redirectRes = NextResponse.redirect(new URL('/', url))
  // Secure cookie settings: HttpOnly, SameSite=Lax, Path=/, expire in 1 hour
  redirectRes.cookies.set('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  })

  return redirectRes
}
