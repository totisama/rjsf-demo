import { useMemo, useState } from 'react'
import type { FieldProps, RJSFSchema } from '@rjsf/utils'
import type { Row } from '../../types'
import {
  evaluateShowWhen,
  evaluateShowWhenAnd,
  type ShowWhen,
} from '../../utils/updateSchema'
import { evaluateFormula } from '../../utils/evalFormula'

interface ColMeta {
  key: string
  label: string
  min?: number
  max?: number
  schema?: RJSFSchema
  isCalculated?: boolean
  formula?: string
}

export function ConsumptionTableField(props: FieldProps) {
  const {
    schema,
    formData,
    onChange,
    disabled,
    readonly,
    registry,
    formContext,
  } = props
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const rootFormData = useMemo(
    () => formContext?.rootFormData ?? {},
    [formContext?.rootFormData]
  )

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

    const raw = Object.entries(rowProperties).map(
      ([propertyKey, propertySchema]) => {
        const ps = propertySchema as RJSFSchema & {
          uiType?: string
          calculationFormula?: string
          showWhen?: ShowWhen
          showWhenAnd?: ShowWhen
        }
        const isCalculated = ps.uiType === 'calculated'
        const formula =
          typeof ps.calculationFormula === 'string'
            ? ps.calculationFormula
            : undefined

        return {
          key: propertyKey,
          label: ps.fuelType ?? propertyKey,
          min: typeof ps.minimum === 'number' ? ps.minimum : undefined,
          max: typeof ps.maximum === 'number' ? ps.maximum : undefined,
          schema: ps,
          isCalculated,
          formula,
          __show: evaluateShowWhen(rootFormData, ps.showWhen),
          __showAnd: evaluateShowWhenAnd(rootFormData, ps.showWhenAnd),
        }
      }
    )

    return raw.filter((c) => c.__show && c.__showAnd)
  }, [properties, registry.schemaUtils, formData, rootFormData])
  const canEdit = !(disabled || readonly)

  const ensureSectionData = () =>
    typeof formData === 'object' && formData !== null
      ? (formData as Record<string, Row>)
      : ({} as Record<string, Row>)

  const recomputeCalculatedForRow = (row: Row, cols: ColMeta[]): Row => {
    const nextRow: Row = { ...row }

    cols.forEach((col) => {
      if (col.isCalculated && col.formula) {
        const val = evaluateFormula(
          col.formula,
          nextRow as Record<string, unknown>
        )
        nextRow[col.key] = Number.isFinite(val as number) ? val : undefined
      }
    })

    return nextRow
  }

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
    if (!rowKey || selectedKeys.includes(rowKey)) {
      return
    }

    setSelectedKeys((prev) => [...prev, rowKey])

    const current = ensureSectionData()
    const row: Row = current[rowKey] ?? {}
    const computedRow = recomputeCalculatedForRow(row, columns)
    onChange({ ...current, [rowKey]: computedRow })
  }

  const removeRow = (rowKey: string) => {
    setSelectedKeys((prev) => prev.filter((k) => k !== rowKey))
    const current = ensureSectionData()
    const next = { ...current }
    delete next[rowKey]
    onChange(next)
  }

  const handleCellChange = (rowKey: string, colKey: string, value: string) => {
    const current = ensureSectionData()
    const editedRow: Row = {
      ...(current[rowKey] || {}),
      [colKey]: Number(value),
    }
    const computedRow = recomputeCalculatedForRow(editedRow, columns)

    onChange({ ...current, [rowKey]: computedRow })
  }

  const handleCellBlur = (
    rowKey: string,
    colKey: string,
    min?: number,
    max?: number
  ) => {
    const current = ensureSectionData()
    const currentValue = current[rowKey]?.[colKey]

    if (
      currentValue &&
      ((min !== undefined && currentValue < min) ||
        (max !== undefined && currentValue > max))
    ) {
      alert(`Value for ${colKey} is out of range. min: ${min}, max: ${max}`)
      const updatedRow: Row = { ...(current[rowKey] || {}) }

      updatedRow[colKey] = undefined
      onChange({ ...current, [rowKey]: updatedRow })
    }
  }

  const getCellValue = (rowKey: string, col: ColMeta) => {
    const current = ensureSectionData()
    const row = current[rowKey] || {}

    if (col.isCalculated && col.formula) {
      const val = evaluateFormula(col.formula, row as Record<string, unknown>)

      return Number.isFinite(val as number) ? (val as number) : ''
    }

    return row[col.key] ?? ''
  }

  const totalsByColumn = columns.map((col) =>
    selectedKeys.reduce((sum, rowKey) => {
      const v = getCellValue(rowKey, col)

      return sum + (typeof v === 'number' ? v : 0)
    }, 0)
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
                      {col.isCalculated ? (
                        <input
                          type="number"
                          value={getCellValue(rowKey, col)}
                          readOnly
                          disabled
                          style={{
                            width: '100%',
                            padding: 6,
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            background: '#f8fafc',
                          }}
                        />
                      ) : (
                        <input
                          type="number"
                          value={getCellValue(rowKey, col)}
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
                      )}
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
