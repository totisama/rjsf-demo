import type { RJSFSchema } from '@rjsf/utils'
import type { JSONObject, JSONValue } from '../types'

type ShowWhenRule = {
  field: string
  equals?: JSONValue
  filled?: boolean
  exist?: boolean
}

type ShowWhen = ShowWhenRule[] | string

function getValueByPath(obj: unknown, path: string): unknown {
  if (!obj || !path) {
    return undefined
  }

  return path.split('.').reduce<unknown>((acc, key) => {
    if (
      acc !== null &&
      typeof acc === 'object' &&
      key in (acc as Record<string, unknown>)
    ) {
      return (acc as Record<string, unknown>)[key]
    }

    return undefined
  }, obj)
}

function deletePropertyByPath(obj: unknown, path: string): void {
  if (!obj || !path || typeof obj !== 'object') {
    return
  }

  const parts = path.split('.')
  const last = parts.pop()!
  const parent = parts.reduce<unknown>((acc, key) => {
    if (typeof acc !== 'object' || acc === null) {
      return undefined
    }

    return (acc as Record<string, unknown>)[key]
  }, obj)

  if (parent && typeof parent === 'object') {
    delete (parent as Record<string, unknown>)[last]
  }
}

function ruleMatches(formData: JSONObject, rule: ShowWhenRule): boolean {
  const val = getValueByPath(formData, rule.field)

  if ('equals' in rule) {
    return val === rule.equals
  }
  if (rule.filled) {
    return val !== undefined && val !== null && val !== ''
  }
  if (rule.exist) {
    return val !== undefined && val !== null
  }

  return false
}

function evaluateShowWhen(formData: JSONObject, rules?: ShowWhen): boolean {
  if (!rules) {
    return true
  }

  if (!Array.isArray(rules) || rules.length === 0) {
    return true
  }

  return rules.some((r) => ruleMatches(formData, r))
}

function evaluateShowWhenAnd(formData: JSONObject, rules?: ShowWhen): boolean {
  if (!rules) {
    return true
  }

  if (!Array.isArray(rules) || rules.length === 0) {
    return true
  }

  return rules.every((r) => ruleMatches(formData, r))
}

export function updateSchema(
  baseSchema: RJSFSchema,
  formData: JSONObject
): { schema: RJSFSchema; formData: JSONObject } {
  const newSchema: RJSFSchema = structuredClone(baseSchema)
  const newData: JSONObject = structuredClone(formData)

  if (!newSchema.properties || typeof newSchema.properties !== 'object') {
    return { schema: newSchema, formData: newData }
  }

  for (const [sectionKey, sectionNode] of Object.entries(
    newSchema.properties
  )) {
    const section = sectionNode as RJSFSchema | undefined
    const sectionProps = section?.properties as
      | Record<string, RJSFSchema>
      | undefined

    if (!sectionProps) {
      continue
    }

    for (const [fieldKey, fieldSchema] of Object.entries(sectionProps)) {
      const field = fieldSchema as RJSFSchema & {
        showWhen?: ShowWhen
        showWhenAnd?: ShowWhen
      }
      const showOr = evaluateShowWhen(newData, field.showWhen)
      const showAnd = evaluateShowWhenAnd(newData, field.showWhenAnd)
      const shouldShow = showOr && showAnd

      if (!shouldShow) {
        const sec = newSchema.properties?.[sectionKey] as RJSFSchema | undefined

        if (sec?.properties) {
          delete sec.properties[fieldKey]
        }
        if (Array.isArray(sec?.required)) {
          sec.required = sec.required.filter((k) => k !== fieldKey)
        }

        deletePropertyByPath(newData, `${sectionKey}.${fieldKey}`)
      }
    }
  }

  return { schema: newSchema, formData: newData }
}
