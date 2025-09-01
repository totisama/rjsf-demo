import type { FieldTemplateProps } from '@rjsf/utils'

export const FieldTemplateNoError = (props: FieldTemplateProps) => {
  const { id, label, required, children, displayLabel } = props

  return (
    <div style={{ marginBottom: 16 }}>
      {displayLabel && label && (
        <label
          htmlFor={id}
          style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
        >
          {label} {required ? '*' : null}
        </label>
      )}

      {children}
    </div>
  )
}
