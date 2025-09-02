import type { WidgetProps } from '@rjsf/utils'
import { useState } from 'react'

export const TextareaWidget = ({
  id,
  value,
  onChange,
  disabled,
  readonly,
  options,
}: WidgetProps) => {
  const max = (options as { maxLength?: number })?.maxLength ?? 200
  const [val, setVal] = useState((value as string) ?? '')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value

    setVal(next)
    onChange(next)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <textarea
        id={id}
        value={val}
        onChange={handleChange}
        maxLength={max}
        disabled={disabled || readonly}
        style={{
          width: '100%',
          minHeight: 80,
          padding: 8,
          border: '1px solid #cbd5e1',
          borderRadius: 6,
        }}
      />
      <div
        style={{
          fontSize: 12,
          textAlign: 'right',
          color: val.length >= max ? '#ef4444' : '#64748b',
        }}
      >
        {val.length}/{max}
      </div>
    </div>
  )
}
