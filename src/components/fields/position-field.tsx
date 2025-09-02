import type { FieldProps, RJSFSchema } from '@rjsf/utils'

type Coord = {
  degrees?: number
  minutes?: number
  seconds?: number
  direction?: string
}
type Position = {
  latitude?: Coord
  longitude?: Coord
}

export const PositionField = ({
  formData,
  onChange,
  disabled,
  readonly,
  schema,
}: FieldProps) => {
  const canEdit = !(disabled || readonly)
  const pos: Position = (formData as Position) ?? {}

  const getDirOptions = (axis: 'latitude' | 'longitude') => {
    const axisSchema = (schema?.properties?.[axis] as RJSFSchema) ?? {}
    const dirSchema = (axisSchema.properties as Record<string, RJSFSchema>)
      ?.direction
    const oneOf = Array.isArray(dirSchema?.oneOf) ? dirSchema!.oneOf! : []
    return oneOf
      .filter(
        (o): o is { title?: string; const?: string } =>
          !!o && typeof o === 'object'
      )
      .map((o) => ({
        value: o.const ?? '',
        label: o.title ?? o.const ?? '',
      }))
  }

  const latDirOptions = getDirOptions('latitude')
  const lonDirOptions = getDirOptions('longitude')

  const handleChange = (
    axis: 'latitude' | 'longitude',
    key: keyof Coord,
    value: string
  ) => {
    const current = pos[axis] ?? {}
    const nextCoord: Coord = { ...current }

    if (key === 'direction') {
      nextCoord.direction = value || undefined
    } else {
      const n = Number(value)
      nextCoord[key] =
        value === '' ? undefined : Number.isFinite(n) ? n : undefined
    }

    const next: Position = { ...pos, [axis]: nextCoord }
    onChange(next)
  }

  const renderCoord = (axis: 'latitude' | 'longitude') => {
    const coord = pos[axis] ?? {}
    const options = axis === 'latitude' ? latDirOptions : lonDirOptions

    return (
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <strong style={{ width: 80 }}>{axis}</strong>
        <input
          type="number"
          placeholder="deg"
          value={coord.degrees ?? ''}
          onChange={(e) => handleChange(axis, 'degrees', e.target.value)}
          disabled={!canEdit}
        />
        <input
          type="number"
          placeholder="min"
          value={coord.minutes ?? ''}
          onChange={(e) => handleChange(axis, 'minutes', e.target.value)}
          disabled={!canEdit}
        />
        <input
          type="number"
          placeholder="sec"
          value={coord.seconds ?? ''}
          onChange={(e) => handleChange(axis, 'seconds', e.target.value)}
          disabled={!canEdit}
        />
        <select
          value={coord.direction ?? ''}
          onChange={(e) => handleChange(axis, 'direction', e.target.value)}
          disabled={!canEdit}
        >
          <option value=""></option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div>
      <h3>Position</h3>
      {renderCoord('latitude')}
      {renderCoord('longitude')}
    </div>
  )
}
