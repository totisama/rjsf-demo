import type { WidgetProps } from '@rjsf/utils'

const maxTitleLength = 80

export const TitleCounterWidget = (props: WidgetProps) => {
  const { id, value, disabled, placeholder, onChange, options } = props

  const text = (value as string) ?? ''
  const max = Number(options?.max) || maxTitleLength
  const isMax = text.length > max

  return (
    <>
      <input
        id={id}
        type="text"
        value={text}
        placeholder={(placeholder as string) ?? 'Task title…'}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: 8,
          borderRadius: 15,
          border: `2px solid ${isMax ? '#ef4444' : '#cbd5e1'}`,
          outline: 'none',
        }}
      />

      <div
        style={{
          textAlign: 'right',
          fontSize: 12,
          color: '#64748b',
          marginTop: 4,
        }}
      >
        {text.length}/{max}
      </div>
    </>
  )
}
