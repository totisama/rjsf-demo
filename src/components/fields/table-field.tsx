import type { ErrorSchema, FieldProps, RJSFSchema, UiSchema } from '@rjsf/utils'

interface TableUiOptions {
  columnLabels?: string[]
}

type TableRow = Record<string, number | undefined>

function isObjectSchema(x: unknown): x is RJSFSchema {
  return typeof x === 'object' && x !== null
}

export const TableField = (props: FieldProps) => {
  const { formData, onChange, disabled, readonly, schema, uiSchema } = props
  const rows = Array.isArray(formData)
    ? (formData as Array<Record<string, number | undefined>>)
    : []

  if (!isObjectSchema(schema.items)) {
    return <div>Invalid table schema</div>
  }

  const properties = (schema.items.properties ?? {}) as RJSFSchema & {
    uiType?: string
  }
  const columnKeys = Object.keys(properties)
  const uiOptionsTyped: TableUiOptions =
    ((uiSchema as UiSchema)?.['ui:options'] as TableUiOptions) ?? {}

  const columnLabels: string[] =
    uiOptionsTyped.columnLabels &&
    uiOptionsTyped.columnLabels.length === columnKeys.length
      ? uiOptionsTyped.columnLabels
      : columnKeys.map((key) => properties[key]?.title ?? key)

  const isEditable = !(disabled || readonly)

  const toNumberOrUndefined = (value: string): number | undefined => {
    if (value === '') return undefined
    const castedValue = Number(value)

    return Number.isFinite(castedValue) ? castedValue : undefined
  }

  const handleCellChange = (
    rowIndex: number,
    columnKey: string,
    rawValue: string
  ) => {
    const nextRows = rows.map((row, i) => {
      if (i !== rowIndex) return row

      return {
        ...row,
        [columnKey]: toNumberOrUndefined(rawValue),
      }
    })

    onChange(nextRows)
  }

  const handleCellBlur = (rowIndex: number, columnKey: string) => {
    const current = rows[rowIndex]?.[columnKey]

    if (!current) return

    const colSchema = (properties as Record<string, RJSFSchema>)[columnKey]
    const min = colSchema.minimum
    const max = colSchema.maximum

    const belowMin = typeof min === 'number' && current < min
    const aboveMax = typeof max === 'number' && current > max

    if (belowMin || aboveMax) {
      const updatedRows = rows.map((row, i) =>
        i === rowIndex ? { ...row } : row
      )

      updatedRows[rowIndex][columnKey] = undefined
      onChange(updatedRows)
    }
  }

  const addRow = () => {
    const emptyRow: TableRow = {}
    columnKeys.forEach((k) => (emptyRow[k] = undefined))
    onChange([...(rows ?? []), emptyRow])
  }

  const removeRow = (rowIndex: number) => {
    onChange(rows.filter((_, i) => i !== rowIndex))
  }

  const getErrorsForCell = (rowIndex: number, columnKey: string): string[] => {
    const root = props.errorSchema as Record<string, ErrorSchema>
    const row = root[String(rowIndex)] as
      | Record<string, ErrorSchema>
      | undefined
    const cell = row?.[columnKey]
    const list = cell?.__errors ?? []

    return Array.isArray(list) ? list : []
  }

  const cellHasError = (rowIndex: number, columnKey: string) => {
    return getErrorsForCell(rowIndex, columnKey).length > 0
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        {rows.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columnLabels.map((label) => (
                  <th
                    key={label}
                    style={{
                      textAlign: 'left',
                      padding: 8,
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    {label}
                  </th>
                ))}
                <th style={{ width: 64 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {columnKeys.map((colKey) => {
                    const colSchema = properties[colKey] as RJSFSchema

                    return (
                      <td key={colKey} style={{ padding: 6 }}>
                        <input
                          type="number"
                          value={row[colKey] ?? ''}
                          onChange={(e) => {
                            handleCellChange(rIdx, colKey, e.target.value)
                          }}
                          onBlur={() => {
                            handleCellBlur(rIdx, colKey)
                          }}
                          disabled={!isEditable}
                          min={colSchema.minimum}
                          max={colSchema.maximum}
                          style={{
                            width: '100%',
                            padding: 6,
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                          }}
                        />
                        {cellHasError(rIdx, colKey) && (
                          <div
                            style={{
                              color: '#ef4444',
                              fontSize: 11,
                              marginTop: 4,
                            }}
                          >
                            {getErrorsForCell(rIdx, colKey)[0]}
                          </div>
                        )}
                      </td>
                    )
                  })}
                  <td style={{ padding: 6, textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => removeRow(rIdx)}
                      disabled={
                        !isEditable || rows.length <= (schema.minItems ?? 0)
                      }
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
            </tbody>
          </table>
        )}
      </div>

      <button
        type="button"
        onClick={addRow}
        disabled={!isEditable}
        style={{
          marginTop: 10,
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid #cbd5e1',
        }}
      >
        Add row
      </button>
    </div>
  )
}
