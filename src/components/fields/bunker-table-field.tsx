import type { FieldProps, RJSFSchema } from '@rjsf/utils'
import type { Row } from '../../types'

type BunkerData = { totalRobPerBunkerGrade?: Row }

export function BunkerTableField(props: FieldProps) {
  const { formData, onChange, schema, disabled, readonly } = props
  const canEdit = !(disabled || readonly)

  const totalKey = 'totalRobPerBunkerGrade'
  const totalSchema = (schema.properties?.[totalKey] as RJSFSchema) ?? {}
  const fuelProps = (totalSchema.properties ?? {}) as Record<string, RJSFSchema>
  const fuels = Object.keys(fuelProps)

  const current: BunkerData = (formData as BunkerData) ?? {}
  const currentRow: Row = current[totalKey] ?? {}

  const handleChange = (fuel: string, raw: string) => {
    const value = Number(raw)
    const nextInner: Row = { ...currentRow }

    if (raw === '' || !Number.isFinite(value)) {
      delete nextInner[fuel]
    } else {
      nextInner[fuel] = value
    }

    onChange({ ...(current as object), [totalKey]: nextInner })
  }

  const handleBlur = (fuel: string) => {
    const value = currentRow[fuel]

    if (value === undefined) return

    const { minimum, maximum } = fuelProps[fuel] ?? {}
    const outOfRange =
      (typeof minimum === 'number' && value < minimum) ||
      (typeof maximum === 'number' && value > maximum)

    if (outOfRange) {
      alert(
        `Value for ${fuel} is out of range. min: ${minimum}, max: ${maximum}`
      )
      const nextInner: Row = { ...currentRow }
      delete nextInner[fuel]
      onChange({ ...(current as object), [totalKey]: nextInner })
    }
  }

  return (
    <fieldset>
      {schema.title && <legend>{schema.title}</legend>}
      <div style={{ display: 'flex', width: '100%', gap: 12 }}>
        {totalSchema.title && <h4>{totalSchema.title}</h4>}
        {fuels.map((fuel) => {
          const fp = fuelProps[fuel] ?? {}
          const min = fp.minimum as number | undefined
          const max = fp.maximum as number | undefined

          return (
            <div
              key={fuel}
              style={{
                width: '30%',
              }}
            >
              <label style={{ fontSize: 12, fontWeight: 600 }} htmlFor={fuel}>
                {fp.title ?? fuel}
              </label>
              <input
                id={fuel}
                type="number"
                value={currentRow[fuel] ?? ''}
                onChange={(e) => handleChange(fuel, e.target.value)}
                onBlur={() => handleBlur(fuel)}
                disabled={!canEdit}
                min={min}
                max={max}
                style={{
                  width: '100%',
                  padding: 6,
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                }}
              />
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
