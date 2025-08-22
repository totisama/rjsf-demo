import type { Priority } from './App'

export const colors: Record<
  Priority,
  { bg: string; border: string; text: string }
> = {
  low: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  medium: { bg: '#ffedd5', border: '#f97316', text: '#7c2d12' },
  high: { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d' },
}
