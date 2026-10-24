export const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v)
    return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.')
  } catch {
    return false
  }
}

// "saimjs.com" -> "https://saimjs.com"; anything with a non-http scheme (javascript:, data:) is left for validation to reject
export const normalizeUrl = (v: unknown) => {
  const s = typeof v === 'string' ? v.trim() : ''
  if (!s) return s
  return /^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s.replace(/^\/+/, '')}`
}
