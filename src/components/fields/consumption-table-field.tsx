import { useMemo, useState } from 'react'
import type { FieldProps, RJSFSchema } from '@rjsf/utils'

type Row = Record<string, number | undefined>

export function ConsumptionTableField(props: FieldProps) {
  const { schema, formData, onChange, disabled, readonly, registry } = props
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  const properties = useMemo(() => schema.properties ?? {}, [schema.properties])
  const allOptions = useMemo(() => {
    const list: Array<{ key: string; label: string }> = []

    Object.entries(properties).forEach(([key, def]) => {
      if (def && typeof def === 'object') {
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

      <div style={{ display: 'grid', gap: 8 }}>
        {selectedKeys.map((rowKey) => (
          <div key={rowKey}>
            <div style={{ fontWeight: 600 }}>{labelFor(rowKey)}</div>
            <button
              type="button"
              onClick={() => removeRow(rowKey)}
              disabled={!canEdit}
            >
              Delete row
            </button>
          </div>
        ))}
      </div>
    </fieldset>
  )
}
