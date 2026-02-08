// Server-only configuration constants.
// Place small, non-secret constants here. Secrets should remain in environment variables.

// The CAS base URL is fixed for this project (UConn CAS) and treated as a constant
// to avoid unnecessary environment configuration and accidental exposure.
export const CAS_BASE = 'https://login.uconn.edu/cas'

// The CAS login endpoint (useful in client code when constructing redirects)
export const CAS_LOGIN = `${CAS_BASE}/login`
