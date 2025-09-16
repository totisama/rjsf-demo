import { useMemo } from 'react'
import type { FieldProps, RJSFSchema } from '@rjsf/utils'
import { hhmmToMinutes, minutesToHHMM } from '../../utils/sumTime'

type ColMeta = { key: string; label: string; sumTimeFormula?: string }

type SingleCellProps = {
  rowKey: string
  loneCol?: ColMeta
  resolved?: RJSFSchema
  currentRow: Record<string, unknown>
  formData: unknown
  canEdit: boolean
  computeSumTime: (formula: string) => string
  handleCellChange: (rowKey: string, colKey: string, value: string) => void
  ensureData: () => Record<string, Record<string, unknown>>
  onChange: (next: unknown) => void
}

function get(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined
  return path.split('.').reduce<unknown>((acc, key) => {
    if (
      acc &&
      typeof acc === 'object' &&
      key in (acc as Record<string, unknown>)
    ) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

export function UtilizationTableField(props: FieldProps) {
  const { schema, formData, onChange, disabled, readonly, registry, idSchema } =
    props
  const sectionKey = useMemo(
    () => idSchema.$id.replace(/^root_/, ''),
    [idSchema.$id]
  )
  const canEdit = !(disabled || readonly)

  // Resolve each row schema so we can read its actual properties (1 vs 4 columns)
  const resolvedRowSchemas = useMemo(() => {
    const sectionProps = (schema.properties ?? {}) as Record<string, RJSFSchema>
    const map: Record<string, RJSFSchema> = {}

    for (const [rowKey, rowDef] of Object.entries(sectionProps)) {
      if (rowDef && typeof rowDef === 'object') {
        map[rowKey] = registry.schemaUtils.retrieveSchema(
          rowDef as RJSFSchema,
          formData
        )
      }
    }

    return map
  }, [schema.properties, registry.schemaUtils, formData])

  // Build columns per row
  const columnsByRowKey = useMemo(() => {
    const out: Record<string, ColMeta[]> = {}

    for (const [rowKey, resolvedRowSchema] of Object.entries(
      resolvedRowSchemas
    )) {
      const rowProps = (resolvedRowSchema.properties ?? {}) as Record<
        string,
        RJSFSchema
      >
      const cols: ColMeta[] = Object.entries(rowProps).map(
        ([propKey, propSchema]) => {
          const ps = propSchema as RJSFSchema & { sumTimeFormula?: string }
          return {
            key: propKey,
            label: (ps.title as string) ?? propKey,
            sumTimeFormula:
              typeof ps.sumTimeFormula === 'string'
                ? ps.sumTimeFormula
                : undefined,
          }
        }
      )
      out[rowKey] = cols
    }

    return out
  }, [resolvedRowSchemas])

  // Header columns = widest set across rows (usually 4)
  const headerColumns = useMemo<ColMeta[]>(() => {
    let maxLen = 0
    let labelSource: ColMeta[] | null = null

    for (const cols of Object.values(columnsByRowKey)) {
      if (cols.length > maxLen) {
        maxLen = cols.length
        labelSource = cols
      }
    }

    return Array.from({ length: maxLen }).map((_, i) => {
      return { key: String(i), label: labelSource?.[i]?.label ?? `No ${i + 1}` }
    })
  }, [columnsByRowKey])

  const rowLabel = useMemo(() => {
    const sectionProps = (schema.properties ?? {}) as Record<string, RJSFSchema>

    return (rowKey: string) =>
      (sectionProps[rowKey]?.title as string) ??
      (resolvedRowSchemas[rowKey]?.title as string) ??
      rowKey
  }, [schema.properties, resolvedRowSchemas])

  const ensureData = () =>
    (formData && typeof formData === 'object' ? formData : {}) as Record<
      string,
      Record<string, unknown>
    >

  const handleCellChange = (rowKey: string, colKey: string, value: string) => {
    const current = ensureData()
    const nextRow = { ...(current[rowKey] || {}), [colKey]: value }

    onChange({ ...current, [rowKey]: nextRow })
  }

  const computeSumTime = (formula: string): string => {
    const tokens = formula
      .split('+')
      .map((s) => s.trim())
      .filter(Boolean)

    const minutes = tokens.reduce((sum, token) => {
      const fullPath = `${sectionKey}.${token}`
      const v = get({ [sectionKey]: formData }, fullPath)

      return sum + hhmmToMinutes(v)
    }, 0)

    return minutesToHHMM(minutes)
  }

  const rowKeys = useMemo(
    () => Object.keys(schema.properties ?? {}),
    [schema.properties]
  )

  if (rowKeys.length === 0) {
    return null
  }

  const SingleCell = ({
    rowKey,
    loneCol,
    resolved,
    currentRow,
    formData,
    canEdit,
    computeSumTime,
    handleCellChange,
    ensureData,
    onChange,
  }: SingleCellProps) => {
    const sumFormula = loneCol?.sumTimeFormula

    let value = ''
    if (sumFormula) {
      value = computeSumTime(sumFormula)
    } else if (resolved && resolved.type === 'object' && loneCol) {
      value = (currentRow[loneCol.key] as string) ?? ''
    } else {
      value = ((formData as Record<string, unknown>)?.[rowKey] as string) ?? ''
    }

    const onChangeValue = (next: string) => {
      if (sumFormula) {
        return
      }

      if (resolved && resolved.type === 'object' && loneCol) {
        handleCellChange(rowKey, loneCol.key, next)
      } else {
        const current = ensureData()
        onChange({ ...current, [rowKey]: next })
      }
    }

    return (
      <td style={{ padding: 6 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          readOnly={!!sumFormula}
          disabled={!!sumFormula || !canEdit}
          style={{
            padding: 6,
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            background: sumFormula ? '#f8fafc' : undefined,
          }}
        />
      </td>
    )
  }

  return (
    <fieldset>
      {schema.title && <legend>{schema.title}</legend>}
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
              {headerColumns.map((c) => (
                <th
                  key={c.key}
                  style={{
                    textAlign: 'left',
                    padding: 8,
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  {c.label || '\u00A0'}
                </th>
              ))}
              <th style={{ width: 1 }} />
            </tr>
          </thead>

          <tbody>
            {rowKeys.map((rowKey) => {
              const colsForRow = columnsByRowKey[rowKey] ?? []
              const resolved = resolvedRowSchemas[rowKey]
              const isSingleCol =
                colsForRow.length === 1 ||
                !resolved ||
                resolved.type !== 'object' ||
                !resolved.properties
              const currentRow = ensureData()[rowKey] || {}

              return (
                <tr key={rowKey}>
                  <td style={{ padding: 6, fontWeight: 600 }}>
                    {rowLabel(rowKey)}
                  </td>

                  {isSingleCol ? (
                    <SingleCell
                      rowKey={rowKey}
                      loneCol={colsForRow[0]}
                      resolved={resolved}
                      currentRow={currentRow}
                      formData={formData}
                      canEdit={canEdit}
                      computeSumTime={computeSumTime}
                      handleCellChange={handleCellChange}
                      ensureData={ensureData}
                      onChange={onChange}
                    />
                  ) : (
                    headerColumns.map((_, i) => {
                      const colMeta = colsForRow[i]
                      if (!colMeta) return <td key={i} style={{ padding: 6 }} />

                      const sumFormula = colMeta.sumTimeFormula
                      const value = sumFormula
                        ? computeSumTime(sumFormula)
                        : (currentRow[colMeta.key] as string) ?? ''

                      return (
                        <td key={i} style={{ padding: 6 }}>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) =>
                              !sumFormula &&
                              handleCellChange(
                                rowKey,
                                colMeta.key,
                                e.target.value
                              )
                            }
                            readOnly={!!sumFormula}
                            disabled={!!sumFormula || !canEdit}
                            style={{
                              padding: 6,
                              border: '1px solid #cbd5e1',
                              borderRadius: 8,
                              background: sumFormula ? '#f8fafc' : undefined,
                            }}
                          />
                        </td>
                      )
                    })
                  )}

                  <td />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </fieldset>
  )
}
