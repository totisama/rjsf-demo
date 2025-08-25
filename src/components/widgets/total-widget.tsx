import type { WidgetProps } from '@rjsf/utils'
import type { Form1Values } from '../forms/first-form'
import { useEffect, useMemo } from 'react'

export const TotalWidget = (props: WidgetProps) => {
  const { value, onChange, disabled, readonly, formContext, id } = props
  const data = formContext?.currentData as Form1Values | undefined

  const total = useMemo(() => {
    const a =
      typeof data?.a === 'number' && Number.isFinite(data.a) ? data.a : 0
    const b =
      typeof data?.b === 'number' && Number.isFinite(data.b) ? data.b : 0
    const c =
      typeof data?.c === 'number' && Number.isFinite(data.c) ? data.c : 0

    return a + b + c
  }, [data?.a, data?.b, data?.c])

  useEffect(() => {
    if (value !== total) {
      onChange(total)
    }
  }, [total]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <input
      id={id}
      type="number"
      value={total}
      readOnly
      disabled={disabled || readonly}
      style={{
        width: '100%',
        padding: 8,
        borderRadius: 8,
        border: '1px solid #cbd5e1',
      }}
    />
  )
}
