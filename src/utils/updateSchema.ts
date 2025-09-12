import type { RJSFSchema } from '@rjsf/utils'
import type { JSONObject, JSONValue } from '../types'
import { getValueByPath } from './getValueByPath'

type ShowWhenRule = {
  field: string
  equals?: JSONValue
  filled?: boolean
  exist?: boolean
}

export type ShowWhen = ShowWhenRule[] | string

type ShowWhenSelectedItem = {
  value: JSONValue
  fieldSchema: Record<string, RJSFSchema>
  required?: boolean
}
type ShowWhenSelected = ShowWhenSelectedItem[]

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

export function ruleMatches(formData: JSONObject, rule: ShowWhenRule): boolean {
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

export function evaluateShowWhen(
  formData: JSONObject,
  rules?: ShowWhen
): boolean {
  if (!rules) {
    return true
  }

  if (!Array.isArray(rules) || rules.length === 0) {
    return true
  }

  return rules.some((rule) => ruleMatches(formData, rule))
}

export function evaluateShowWhenAnd(
  formData: JSONObject,
  rules?: ShowWhen
): boolean {
  if (!rules) {
    return true
  }

  if (!Array.isArray(rules) || rules.length === 0) {
    return true
  }

  return rules.every((rule) => ruleMatches(formData, rule))
}

function findShowWhenSelectedMatch(
  formData: JSONObject,
  controllerPath: string,
  items?: ShowWhenSelected
): ShowWhenSelectedItem | undefined {
  if (!items || items.length === 0) {
    return undefined
  }
  const current = getValueByPath(formData, controllerPath)

  return items.find((item) => item.value === current)
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
    const sectionSchema = sectionNode as RJSFSchema | undefined
    const sectionProperties = sectionSchema?.properties as
      | Record<string, RJSFSchema>
      | undefined

    if (!sectionProperties) {
      continue
    }

    for (const [fieldKey, fieldSchema] of Object.entries(sectionProperties)) {
      const fieldDefinition = fieldSchema as RJSFSchema & {
        showWhen?: ShowWhen
        showWhenAnd?: ShowWhen
        showWhenSelected?: ShowWhenSelected
      }

      const showOr = evaluateShowWhen(newData, fieldDefinition.showWhen)
      const showAnd = evaluateShowWhenAnd(newData, fieldDefinition.showWhenAnd)
      const shouldShow = showOr && showAnd
      const sectionObject = newSchema.properties?.[sectionKey] as
        | RJSFSchema
        | undefined

      // If this field is not visible, also clean up any extra fields that were previously added because of it
      if (!shouldShow) {
        if (sectionObject?.properties) {
          delete sectionObject.properties[fieldKey]
        }

        if (Array.isArray(sectionObject?.required)) {
          sectionObject.required = sectionObject.required.filter(
            (fieldName) => fieldName !== fieldKey
          )
        }

        deletePropertyByPath(newData, `${sectionKey}.${fieldKey}`)
        if (fieldDefinition.showWhenSelected && sectionObject?.properties) {
          for (const item of fieldDefinition.showWhenSelected) {
            for (const injectedKey of Object.keys(item.fieldSchema)) {
              delete sectionObject.properties[injectedKey]

              if (Array.isArray(sectionObject.required)) {
                sectionObject.required = sectionObject.required.filter(
                  (fieldName) => fieldName !== injectedKey
                )
              }

              deletePropertyByPath(newData, `${sectionKey}.${injectedKey}`)
            }
          }
        }

        continue
      }

      if (fieldDefinition.showWhenSelected) {
        const controllerPath = `${sectionKey}.${fieldKey}`
        const match = findShowWhenSelectedMatch(
          newData,
          controllerPath,
          fieldDefinition.showWhenSelected
        )

        // Remove any injected fields that dont match the current selection
        if (sectionObject?.properties) {
          for (const item of fieldDefinition.showWhenSelected) {
            for (const injectedKey of Object.keys(item.fieldSchema)) {
              if (!match || !(injectedKey in match.fieldSchema)) {
                delete sectionObject.properties[injectedKey]

                if (Array.isArray(sectionObject.required)) {
                  sectionObject.required = sectionObject.required.filter(
                    (fieldName) => fieldName !== injectedKey
                  )
                }
                deletePropertyByPath(newData, `${sectionKey}.${injectedKey}`)
              }
            }
          }
        }

        // Inject matching fields
        if (match) {
          sectionObject!.properties ??= {}

          for (const [injectedKey, injectedSchema] of Object.entries(
            match.fieldSchema
          )) {
            sectionObject!.properties[injectedKey] = injectedSchema
          }

          if (match.required) {
            sectionObject!.required ??= []

            for (const injectedKey of Object.keys(match.fieldSchema)) {
              if (!sectionObject!.required.includes(injectedKey)) {
                sectionObject!.required.push(injectedKey)
              }
            }
          }
        }
      }
    }
  }

  return { schema: newSchema, formData: newData }
}
