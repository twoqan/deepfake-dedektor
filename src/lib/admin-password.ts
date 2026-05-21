/** Ortamdan kabul edilen admin şifreleri (scores export ve /api/admin POST ile uyumlu). */

function getAcceptedAdminPasswords(): Set<string> {
  const set = new Set<string>();
  for (const key of ['ADMIN_PASSWORD', 'NEXT_PUBLIC_ADMIN_PASSWORD'] as const) {
    const raw = process.env[key];
    if (typeof raw === 'string') {
      const t = raw.trim();
      if (t !== '') set.add(t);
    }
  }
  if (set.size === 0) set.add('admin123');
  return set;
}

export function isAdminPasswordOk(inputTrimmed: string): boolean {
  return getAcceptedAdminPasswords().has(inputTrimmed);
}

/** GET istekleri için şifre: `X-Admin-Password` veya `Authorization: Bearer …`. */
export function extractAdminPasswordFromRequest(request: Request): string {
  const header = request.headers.get('x-admin-password');
  if (header != null && header.trim() !== '') return header.trim();
  const auth = request.headers.get('authorization');
  if (auth != null && auth.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim();
    return token;
  }
  return '';
}
