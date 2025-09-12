export function getValueByPath(obj: unknown, path: string): unknown {
  if (!obj || !path) {
    return undefined
  }

  return path.split('.').reduce<unknown>((acc, key) => {
    if (
      acc !== null &&
      typeof acc === 'object' &&
      key in (acc as Record<string, unknown>)
    ) {
      return (acc as Record<string, unknown>)[key]
    }

    return undefined
  }, obj)
}
