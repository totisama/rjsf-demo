import { useEffect, useRef } from 'react'
import type { FieldProps, RJSFSchema } from '@rjsf/utils'
import { hhmmToMinutes, minutesToHHMM } from '../../utils/sumTime'

export const SumTimeTotalField = (props: FieldProps) => {
  const {
    idSchema,
    schema,
    formData,
    onChange,
    disabled,
    readonly,
    formContext,
  } = props
  const last = useRef<string | undefined>(undefined)
  const parts = idSchema.$id.replace(/^root_/, '').split('_')
  const parentSectionKey = parts[0]

  const compute = (): string => {
    const formula = (schema as RJSFSchema & { sumTimeFormula?: string })
      .sumTimeFormula

    if (typeof formula !== 'string') {
      return typeof formData === 'string' ? formData : '00:00'
    }

    const tokens = formula
      .split('+')
      .map((s) => s.trim())
      .filter(Boolean)

    const sectionRoot = formContext?.rootFormData?.[parentSectionKey] ?? {}
    const minutes = tokens.reduce((sum, token) => {
      const [subSection, subField] = token.split('.')
      const raw = sectionRoot?.[subSection]?.[subField]

      return sum + hhmmToMinutes(raw)
    }, 0)

    return minutesToHHMM(minutes)
  }

  const computed = compute()

  // Only write back when value actually changes (prevents loops & extra renders)
  useEffect(() => {
    if (computed !== last.current) {
      last.current = computed
      onChange(computed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computed])

  return (
    <input
      type="text"
      value={computed}
      readOnly
      disabled={disabled || readonly}
    />
  )
}
