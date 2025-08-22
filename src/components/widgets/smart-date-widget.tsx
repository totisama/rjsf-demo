import type { WidgetProps } from '@rjsf/utils'

export const SmartDateWidget = (props: WidgetProps) => {
  const { id, value, disabled, onChange } = props

  const todayISODate = new Date().toISOString().split('T')[0]
  const isPast = value ? String(value) < todayISODate : false

  return (
    <div>
      <input
        id={id}
        type="date"
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: 8,
          borderRadius: 15,
          border: `2px solid ${isPast ? '#ef4444' : '#cbd5e1'}`,
          outline: 'none',
        }}
      />

      {isPast && (
        <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
          This date is in the past
        </div>
      )}
    </div>
  )
}
