import type { FieldProps } from '@rjsf/utils'

interface ExtraFieldUiOptions {
  prefix?: string
}

export const KeyValueField = (props: FieldProps) => {
  const { formData = {}, onChange, disabled, readonly, uiSchema } = props

  const extraFields: Record<string, string> = {
    ...(formData as Record<string, string>),
  }

  const options = (uiSchema?.['ui:options'] ?? {}) as ExtraFieldUiOptions
  const fieldPrefix = options.prefix ?? 'field'

  const generateUniqueFieldName = (baseName: string) => {
    let candidate = baseName
    let counter = 1

    while (Object.prototype.hasOwnProperty.call(extraFields, candidate)) {
      candidate = `${baseName}_${counter++}`
    }

    return candidate
  }

  const handleAddField = () => {
    const newFieldName = generateUniqueFieldName(fieldPrefix)
    const updatedFields = { ...extraFields, [newFieldName]: '' }

    onChange(updatedFields)
  }

  const handleRemoveField = (fieldName: string) => {
    const updatedFields = { ...extraFields }

    delete updatedFields[fieldName]
    onChange(updatedFields)
  }

  const handleRenameField = (oldFieldName: string, newFieldName: string) => {
    const trimmedName = newFieldName.trim()

    if (
      !trimmedName ||
      trimmedName === oldFieldName ||
      Object.prototype.hasOwnProperty.call(extraFields, trimmedName)
    ) {
      return
    }

    const updatedFields: Record<string, string> = {}

    for (const [key, value] of Object.entries(extraFields)) {
      updatedFields[key === oldFieldName ? trimmedName : key] = value
    }

    onChange(updatedFields)
  }

  const handleChangeValue = (fieldName: string, newValue: string) => {
    onChange({ ...extraFields, [fieldName]: newValue })
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(extraFields).map(([key, val]) => (
          <div
            key={key}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.2fr auto',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              defaultValue={key}
              disabled={disabled || readonly}
              onBlur={(e) => handleRenameField(key, e.target.value)}
              style={{
                padding: 8,
                border: '1px solid #cbd5e1',
                borderRadius: 15,
              }}
            />
            <input
              type="text"
              value={val}
              disabled={disabled || readonly}
              onChange={(e) => handleChangeValue(key, e.target.value)}
              style={{
                padding: 8,
                border: '1px solid #cbd5e1',
                borderRadius: 15,
              }}
            />
            <button
              type="button"
              onClick={() => handleRemoveField(key)}
              disabled={disabled || readonly}
              style={{
                padding: '6px 10px',
                borderRadius: 15,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                background: 'red',
              }}
            >
              X
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddField}
        disabled={disabled || readonly}
        style={{
          marginTop: 10,
          padding: '6px 10px',
          borderRadius: 15,
          border: '1px solid #cbd5e1',
          background: 'green',
        }}
      >
        New field
      </button>
    </div>
  )
}
