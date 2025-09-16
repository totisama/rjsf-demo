import type { WidgetProps } from '@rjsf/utils'

export const EmailWidget = ({
  id,
  value,
  onChange,
  disabled,
  readonly,
  placeholder,
}: WidgetProps) => {
  return (
    <input
      id={id}
      type="email"
      value={(value as string) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder as string}
      disabled={disabled || readonly}
      style={{
        padding: 8,
        border: '1px solid #cbd5e1',
        borderRadius: 6,
      }}
    />
  )
}
