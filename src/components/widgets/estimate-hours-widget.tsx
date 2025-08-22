import type { WidgetProps } from '@rjsf/utils'

export const EstimateHoursWidget = (props: WidgetProps) => {
  const { id, value, onChange, disabled, options } = props

  const min = Number(options?.min ?? 0)
  const max = Number(options?.max ?? 40)
  const step = Number(options?.step ?? 1)
  const val = typeof value === 'number' ? value : min

  return (
    <div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
      <div style={{ textAlign: 'right', fontSize: 12, color: '#475569' }}>
        {val}
      </div>
    </div>
  )
}
