import type { WidgetProps } from '@rjsf/utils'

export const RadioWidget = ({
  value,
  onChange,
  options,
  disabled,
  readonly,
}: WidgetProps) => {
  const opts = options.enumOptions as { value: string; label: string }[]
  const canEdit = !(disabled || readonly)

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      {opts.map((opt) => (
        <label
          key={opt.value}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <input
            type="radio"
            name="custom-radio"
            value={opt.value}
            checked={value === opt.value}
            onChange={() => canEdit && onChange(opt.value)}
            disabled={!canEdit}
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}
