import type { WidgetProps } from '@rjsf/utils'

export const NumberBlurClearWidget = (props: WidgetProps) => {
  const { id, value, onChange, onBlur, disabled, readonly, placeholder } = props
  const inputValue = value === undefined || value === null ? '' : String(value)

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredValue = e.target.value
    onChange(enteredValue)
  }

  const handleBlur = () => {
    if (value < 0) {
      onChange(0)
    }

    onBlur(id, value)
  }

  return (
    <input
      id={id}
      type="number"
      value={inputValue}
      onChange={handleOnChange}
      onBlur={handleBlur}
      placeholder={placeholder}
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
