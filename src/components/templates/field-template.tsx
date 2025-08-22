import type { FieldTemplateProps } from '@rjsf/utils'

export const FieldTemplate = (props: FieldTemplateProps) => {
  const { id, label, required, children, rawErrors = [] } = props

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          htmlFor={id}
          style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
        >
          {label} {required ? '*' : null}
        </label>
      )}

      {children}

      {rawErrors.length > 0 && (
        <ul
          style={{
            margin: '6px 0 0',
            paddingLeft: 18,
            color: '#ef4444',
            fontSize: 12,
            listStyleType: 'none',
          }}
        >
          {rawErrors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
