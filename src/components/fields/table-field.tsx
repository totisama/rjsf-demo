import type { ErrorSchema, FieldProps, RJSFSchema, UiSchema } from '@rjsf/utils'
import type { TableBehavior, TableSchema } from '../../types'

interface TableUiOptions {
  columnLabels?: string[]
}

type TableRow = Record<string, number | undefined>

function isObjectSchema(x: unknown): x is TableSchema {
  return typeof x === 'object' && x !== null
}

export const TableField = (props: FieldProps) => {
  const { formData, onChange, disabled, readonly, schema, uiSchema } = props

  if (!isObjectSchema(schema.items)) {
    return <div>Invalid table schema</div>
  }

  const rows = Array.isArray(formData)
    ? (formData as Array<Record<string, number | undefined>>)
    : []
  const properties = (schema.items.properties ?? {}) as Record<
    string,
    RJSFSchema
  >
  const tableBehavior =
    (schema as unknown as { xTableBehavior?: TableBehavior }).xTableBehavior ??
    {}

  const columnKeys = Object.keys(properties)
  const uiOptionsTyped: TableUiOptions =
    ((uiSchema as UiSchema)?.['ui:options'] as TableUiOptions) ?? {}

  const columnLabels: string[] =
    uiOptionsTyped.columnLabels &&
    uiOptionsTyped.columnLabels.length === columnKeys.length
      ? uiOptionsTyped.columnLabels
      : columnKeys.map((key) => properties[key]?.title ?? key)

  const rowsCount = rows.length
  const isFixed = !!tableBehavior.fixedRows
  const isColumnsSum = tableBehavior.mode === 'columnsSum'
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

    onChange(isColumnsSum ? computeLastRow(nextRows) : nextRows)
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
      onChange(isColumnsSum ? computeLastRow(updatedRows) : updatedRows)
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

  const computeLastRow = (currentRows: TableRow[]): TableRow[] => {
    if (!isColumnsSum) return currentRows

    const lastIndex = currentRows.length - 1
    const sumRow: TableRow = {}

    columnKeys.forEach((key) => {
      let sum = 0

      currentRows.forEach((row, idx) => {
        if (idx !== lastIndex) {
          sum += Number(row[key] ?? 0)
        }
      })
      sumRow[key] = sum
    })

    return currentRows.map((row, idx) =>
      idx === lastIndex ? { ...sumRow } : row
    )
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
    <fieldset>
      {schema.title && <legend>{schema.title}</legend>}
      <div style={{ overflowX: 'auto' }}>
        {rowsCount > 0 && (
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
                    const isComputedRow = isColumnsSum && rIdx === rowsCount - 1

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
                          disabled={!isEditable || isComputedRow}
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
                  {!isFixed && (
                    <td style={{ padding: 6, textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => removeRow(rIdx)}
                        disabled={
                          !isEditable || rowsCount <= (schema.minItems ?? 0)
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
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!isFixed && (
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
      )}
    </fieldset>
  )
}
