import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Set process.env.JWT_SECRET to sign auth tokens.')
}

export function signAuthToken(payload: Record<string, unknown>, opts?: jwt.SignOptions) {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
    ...opts,
    algorithm: 'HS256',
    expiresIn: '1h',
  })
}

export function verifyAuthToken(token: string) {
  try {
    // return jwt.verify(token, JWT_SECRET as jwt.Secret) as Record<string, unknown>
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret, {
      algorithms: ['HS256'],
    })
    if (!decoded || typeof decoded !== 'object') {
      return null
    }
    const payload = decoded as Record<string, unknown>
    if (typeof payload.user !== 'string') {
      return null
    }
    return payload
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
