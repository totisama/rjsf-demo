export function hhmmToMinutes(v: unknown): number {
  if (typeof v !== 'string') {
    return 0
  }

  const m = v.trim().match(/^(\d{1,3}):([0-5]\d)$/)
  if (!m) {
    return 0
  }

  return Number(m[1]) * 60 + Number(m[2])
}

export function minutesToHHMM(total: number): string {
  if (!Number.isFinite(total) || total <= 0) {
    return '00:00'
  }

  const h = Math.floor(total / 60)
  const m = total % 60

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
