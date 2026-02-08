import jwt from 'jsonwebtoken'

const ENV_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET

// Use a secure required secret in production. Allow a development fallback when
// NODE_ENV !== 'production' to make local testing easier. Do NOT use the
// fallback in production.
const DEV_FALLBACK_SECRET = 'nextjs-dev-fallback-secret-please-change'
const JWT_SECRET: string | undefined = ENV_SECRET || (process.env.NODE_ENV === 'production' ? undefined : DEV_FALLBACK_SECRET)

if (!JWT_SECRET) {
  // In production we must have a secret; throw so caller can handle it.
  throw new Error('JWT_SECRET is not set. Set process.env.JWT_SECRET to sign auth tokens.')
}

if (!ENV_SECRET) {
  console.warn('Warning: JWT_SECRET not set — using development fallback secret. Set JWT_SECRET for production.')
}

export function signAuthToken(payload: Record<string, unknown>, opts?: jwt.SignOptions) {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
    algorithm: 'HS256',
    expiresIn: '1h',
    ...opts,
  })
}

export function verifyAuthToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as Record<string, unknown>
  } catch (e) {
    return null
  }
}

export function parseCookieHeader(cookieHeader?: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.split('=')
      return [k.trim(), decodeURIComponent((v || []).join('='))]
    })
  )
}
