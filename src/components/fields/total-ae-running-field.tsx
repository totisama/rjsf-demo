import { useEffect, useMemo } from 'react'
import type { FieldProps, UiSchema } from '@rjsf/utils'
import { getValueByPath } from '../../utils/getValueByPath'

type TotalAeRunningOptions = {
  sourcePath?: string
  keyPattern?: RegExp | string
}

function getOptions(uiSchema: UiSchema | undefined): TotalAeRunningOptions {
  const raw = uiSchema?.['ui:options']
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as TotalAeRunningOptions
  }
  return {}
}

function toRegExp(pat: RegExp | string | undefined): RegExp | undefined {
  if (!pat) {
    return undefined
  }
  if (pat instanceof RegExp) {
    return pat
  }

  try {
    if (pat.startsWith('/') && pat.lastIndexOf('/') > 0) {
      const last = pat.lastIndexOf('/')
      const body = pat.slice(1, last)
      const flags = pat.slice(last + 1)

      return new RegExp(body, flags)
    }

    return new RegExp(pat)
  } catch {
    return undefined
  }
}

export default function TotalAeRunningField(props: FieldProps<number>) {
  const { schema, uiSchema, idSchema, formData, onChange, registry } = props
  const root = useMemo(
    () => registry.formContext?.rootFormData ?? {},
    [registry.formContext?.rootFormData]
  )
  const opts = getOptions(uiSchema)
  const sourcePath = opts.sourcePath ?? ''
  const keyPattern = useMemo(() => toRegExp(opts.keyPattern), [opts.keyPattern])

  const count = useMemo(() => {
    const container = getValueByPath(root, sourcePath)

    if (!container || typeof container !== 'object') {
      return 0
    }

    return Object.entries(container as Record<string, unknown>).reduce(
      (n, [k, v]) => {
        if (keyPattern && !keyPattern.test(k)) {
          return n
        }

        const num =
          typeof v === 'number'
            ? v
            : typeof v === 'string'
            ? parseInt(v, 10)
            : NaN

        return !Number.isNaN(num) && num > 0 ? n + 1 : n
      },
      0
    )
  }, [root, sourcePath, keyPattern])

  useEffect(() => {
    if (formData !== count) {
      onChange(count)
    }
  }, [count]) // eslint-disable-line react-hooks/exhaustive-deps

  const value = typeof formData === 'number' ? formData : count
  const inputId = idSchema?.$id || undefined

  return (
    <div>
      {schema.title && (
        <label
          htmlFor={inputId}
          style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}
        >
          {schema.title}
        </label>
      )}
      <input
        id={inputId}
        type="number"
        value={value}
        readOnly
        disabled={true}
        aria-label={schema.title as string | undefined}
        title={schema.title as string | undefined}
        style={{
          padding: 6,
          border: '1px solid #cbd5e1',
          borderRadius: 8,
          background: '#f8fafc',
        }}
      />
    </div>
  )
}
