import type { FieldProps, RJSFSchema } from '@rjsf/utils'

type DateTime = {
  date?: string
  time?: number
  utc?: string
}

export const DateTimeUtcField = ({
  formData,
  onChange,
  disabled,
  readonly,
  schema,
}: FieldProps) => {
  const canEdit = !(disabled || readonly)
  const data: DateTime = (formData as DateTime) ?? {}

  const utcOneOf =
    (schema?.properties &&
      (schema.properties as Record<string, RJSFSchema>)?.utc &&
      (schema.properties as Record<string, RJSFSchema>).utc.oneOf) ||
    []
  const utcOptions = Array.isArray(utcOneOf)
    ? utcOneOf
        .filter(
          (option): option is { title?: string; const?: string } =>
            !!option && typeof option === 'object'
        )
        .map((option) => ({
          value: option.const ?? '',
          label: option.title ?? option.const ?? '',
        }))
    : []

  const handleChange = (key: keyof DateTime, value: string) => {
    const next: DateTime = { ...data, [key]: value || undefined }
    onChange(next)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {schema.title && (
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
          {schema.title}
        </label>
      )}
      <div>
        <label>Date</label>
        <input
          type="date"
          value={data.date ?? ''}
          onChange={(e) => handleChange('date', e.target.value)}
          disabled={!canEdit}
        />
        <label>Time (hh:mm):</label>
        <input
          type="time"
          step={60}
          value={data.time ?? ''}
          onChange={(e) => handleChange('time', e.target.value)}
          disabled={!canEdit}
        />
        <label>UTC offset:</label>
        <select
          value={data.utc ?? ''}
          onChange={(e) => handleChange('utc', e.target.value)}
          disabled={!canEdit}
        >
          <option value="" />
          {utcOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          disabled={!canEdit}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
