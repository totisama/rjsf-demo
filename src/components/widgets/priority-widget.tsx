import type { WidgetProps } from '@rjsf/utils'
import { colors } from '../../constants'

export const PriorityWidget = (props: WidgetProps) => {
  const { value, onChange, options, disabled } = props
  const enumOptions = (options?.enumOptions ?? []) as {
    value: string
    label: string
  }[]

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {enumOptions.map((opt) => {
        const isActive = value === opt.value
        const color = colors[opt.value as keyof typeof colors] || {
          bg: '#f1f5f9',
          border: '#cbd5e1',
          text: '#0f172a',
        }

        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 15,
              border: `2px solid ${isActive ? color.border : '#cbd5e1'}`,
              background: isActive ? color.bg : '#fff',
              color: isActive ? color.text : '#334155',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
