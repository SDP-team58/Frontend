import { verifyAuthToken, parseCookieHeader } from './auth'

/**
 * Server helper to read the `auth` cookie from a Request and return the
 * authenticated user payload (or null).
 * This runs on the server.
 */
export async function getServerUser(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
  const cookies = parseCookieHeader(cookieHeader)
  const token = cookies['auth']
  if (!token) return null
  const payload = verifyAuthToken(token)
  if (!payload) return null
  return payload
}
