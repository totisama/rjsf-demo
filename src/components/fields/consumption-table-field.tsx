import { useMemo, useState } from 'react'
import type { FieldProps, RJSFSchema } from '@rjsf/utils'

type Row = Record<string, number | undefined>

interface ColMeta {
  key: string
  label: string
  min?: number
  max?: number
}

export function ConsumptionTableField(props: FieldProps) {
  const { schema, formData, onChange, disabled, readonly, registry } = props
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  const properties = useMemo(() => schema.properties ?? {}, [schema.properties])
  const allOptions = useMemo(() => {
    const list: Array<{ key: string; label: string }> = []

    Object.entries(properties).forEach(([key, def]) => {
      if (def && typeof def === 'object') {
        // Resolves $ref using definitions
        const resolved = registry.schemaUtils.retrieveSchema(
          def as RJSFSchema,
          formData
        )
        const label = (def as RJSFSchema).title ?? resolved.title ?? key

        list.push({ key, label })
      }
    })

    return list
  }, [properties, registry.schemaUtils, formData])
  const availableOptions = useMemo(
    () => allOptions.filter((o) => !selectedKeys.includes(o.key)),
    [allOptions, selectedKeys]
  )
  const labelFor = useMemo(
    () => (k: string) => allOptions.find((e) => e.key === k)?.label ?? k,
    [allOptions]
  )
  const columns: ColMeta[] = useMemo(() => {
    const firstPropertyEntry = Object.entries(properties).find(
      ([, propertySchema]) =>
        propertySchema && typeof propertySchema === 'object'
    )

    if (!firstPropertyEntry) return []

    const [, propertySchema] = firstPropertyEntry
    const resolvedRowSchema = registry.schemaUtils.retrieveSchema(
      propertySchema as RJSFSchema,
      formData
    )
    const rowProperties = (resolvedRowSchema.properties ?? {}) as Record<
      string,
      RJSFSchema
    >

    return Object.keys(rowProperties).map((propertyKey) => {
      const propertySchema = rowProperties[propertyKey] as RJSFSchema

      return {
        key: propertyKey,
        label: propertySchema.fuelType ?? propertyKey,
        min:
          typeof propertySchema.minimum === 'number'
            ? propertySchema.minimum
            : undefined,
        max:
          typeof propertySchema.maximum === 'number'
            ? propertySchema.maximum
            : undefined,
      }
    })
  }, [properties, registry.schemaUtils, formData])
  const canEdit = !(disabled || readonly)

  const handleSelectedOptionsChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const chosen = e.target.value

    if (chosen) {
      addRow(chosen)
      e.currentTarget.selectedIndex = 0
    }
  }

  const addRow = (rowKey: string) => {
    if (!rowKey || selectedKeys.includes(rowKey)) return

    setSelectedKeys((prev) => [...prev, rowKey])
    onChange({ ...formData, [rowKey]: (formData[rowKey] as Row) ?? {} })
  }

  const removeRow = (rowKey: string) => {
    setSelectedKeys((prev) => prev.filter((k) => k !== rowKey))
    const next = { ...formData }
    delete next[rowKey]
    onChange(next)
  }

  const handleCellChange = (rowKey: string, colKey: string, value: string) => {
    const nextRow: Row = { ...(formData[rowKey] || {}), [colKey]: value }

    onChange({ ...formData, [rowKey]: nextRow })
  }

  const handleCellBlur = (
    rowKey: string,
    colKey: string,
    min?: number,
    max?: number
  ) => {
    const currentValue = formData[rowKey]?.[colKey]

    if (
      currentValue &&
      ((min !== undefined && currentValue < min) ||
        (max !== undefined && currentValue > max))
    ) {
      const updatedRow: Row = { ...(formData[rowKey] || {}) }

      updatedRow[colKey] = undefined
      onChange({ ...formData, [rowKey]: updatedRow })
    }
  }

  const totalsByColumn = columns.map((col) =>
    selectedKeys.reduce(
      (sum, rowKey) => sum + Number(formData[rowKey]?.[col.key] ?? 0),
      0
    )
  )

  return (
    <fieldset>
      {schema.title && <legend>{schema.title}</legend>}
      <div style={{ marginBottom: 12 }}>
        <select
          disabled={!canEdit || availableOptions.length === 0}
          defaultValue=""
          onChange={handleSelectedOptionsChange}
          style={{ padding: 8, borderRadius: 8, minWidth: 320 }}
        >
          <option value="" disabled>
            Add type of consumption...
          </option>
          {availableOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
        {availableOptions.length === 0 && (
          <span style={{ marginLeft: 8, fontSize: 12, color: '#64748b' }}>
            All types added
          </span>
        )}
      </div>

      {selectedKeys.length > 0 && columns.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: 8,
                    borderBottom: '1px solid #e2e8f0',
                    width: '40%',
                  }}
                >
                  Type
                </th>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    style={{
                      textAlign: 'left',
                      padding: 8,
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    {c.label}
                  </th>
                ))}
                <th style={{ width: 64 }} />
              </tr>
            </thead>

            <tbody>
              {selectedKeys.map((rowKey) => (
                <tr key={rowKey}>
                  <td style={{ padding: 6, fontWeight: 600 }}>
                    {labelFor(rowKey)}
                  </td>

                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: 6 }}>
                      <input
                        type="number"
                        value={formData[rowKey]?.[col.key] ?? ''}
                        onChange={(e) =>
                          handleCellChange(rowKey, col.key, e.target.value)
                        }
                        onBlur={() =>
                          handleCellBlur(rowKey, col.key, col.min, col.max)
                        }
                        disabled={!canEdit}
                        min={col.min}
                        max={col.max}
                        step={0.1}
                        style={{
                          width: '100%',
                          padding: 6,
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                        }}
                      />
                    </td>
                  ))}

                  <td style={{ padding: 6, textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => removeRow(rowKey)}
                      disabled={!canEdit}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

              {selectedKeys.length > 1 && (
                <tr>
                  <td
                    style={{
                      padding: 6,
                      fontWeight: 700,
                      borderTop: '1px solid #e2e8f0',
                    }}
                  >
                    Total
                  </td>
                  {columns.map((col, idx) => (
                    <td
                      key={col.key}
                      style={{ padding: 6, borderTop: '1px solid #e2e8f0' }}
                    >
                      {totalsByColumn[idx]}
                    </td>
                  ))}
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </fieldset>
  )
}
