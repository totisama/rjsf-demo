import type { FieldProps, RJSFSchema } from '@rjsf/utils'

export const FullVoyageNumberField = (props: FieldProps) => {
  const { formData, onChange, disabled, readonly, schema } = props

  const value: Record<string, unknown> =
    formData && typeof formData === 'object'
      ? (formData as Record<string, unknown>)
      : {}

  const vesselCode = (value.vesselCode as string) ?? ''
  const voyageNumber = (value.voyageNumber as string) ?? ''

  const canEdit = !(disabled || readonly)

  const handle = (
    key: 'vesselCode' | 'voyageNumber' | 'direction',
    v: string
  ) => {
    onChange({
      ...value,
      [key]: v,
    })
  }

  const directionOneOf =
    (schema?.properties &&
      (schema.properties as Record<string, RJSFSchema>)?.direction &&
      (schema.properties as Record<string, RJSFSchema>).direction.oneOf) ||
    []
  const directionOptions = Array.isArray(directionOneOf)
    ? directionOneOf
        .filter(
          (option): option is { title?: string; const?: string } =>
            !!option && typeof option === 'object'
        )
        .map((option) => ({
          value: option.const ?? '',
          label: option.title ?? option.const ?? '',
        }))
    : []

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label style={{ minWidth: 90 }}>Vessel code</label>
      <input
        type="text"
        value={vesselCode}
        onChange={(e) => handle('vesselCode', e.target.value)}
        disabled={!canEdit}
        style={{ width: 120 }}
      />

      <label style={{ minWidth: 110 }}>Voyage number</label>
      <input
        type="text"
        value={voyageNumber}
        onChange={(e) => handle('voyageNumber', e.target.value)}
        disabled={!canEdit}
        style={{ width: 140 }}
      />

      <label style={{ minWidth: 80 }}>Direction</label>
      <select
        value={formData?.direction ?? ''}
        onChange={(e) => onChange({ ...formData, direction: e.target.value })}
        disabled={disabled || readonly}
      >
        {directionOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
