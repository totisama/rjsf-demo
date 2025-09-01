import type { ErrorListProps } from '@rjsf/utils'

const startCase = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())

const prettyPath = (raw: string) =>
  raw.split('.').filter(Boolean).map(startCase).join(' -> ')

const tidyMessage = (msg?: string) => {
  if (!msg) return ''
  return msg
    .replace(/is a required property/i, 'is required')
    .replace(
      /should match some schema in anyOf/i,
      'should have at least one of the required values'
    )
}

export function ErrorListTemplate({ errors }: ErrorListProps) {
  if (!errors || errors.length === 0) return null

  return (
    <div
      style={{
        marginTop: 16,
        border: '1px solid #fca5a5',
        background: '#fee2e2',
        borderRadius: 6,
        padding: 12,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: 8,
          color: '#7f1d1d',
          textAlign: 'center',
        }}
      >
        Errors
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, color: '#7f1d1d' }}>
        {errors.map((e, i) => {
          const path = e.property ? prettyPath(e.property) : ''
          const msg = tidyMessage(e.message)

          return <li key={i}>{path ? `${path}: ${msg}` : msg}</li>
        })}
      </ul>
    </div>
  )
}
