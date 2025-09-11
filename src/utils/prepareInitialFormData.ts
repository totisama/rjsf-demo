import type { RJSFSchema } from '@rjsf/utils'
import type { JSONObject } from '../types'
import { todayISODate } from './todayISODate'
import { currentTimeHHMM } from './currentTimeHHMM'

export function prepareInitialFormData(
  schema: RJSFSchema,
  currentData?: JSONObject
): JSONObject {
  const data: JSONObject = currentData ? structuredClone(currentData) : {}

  if (!schema?.properties || typeof schema.properties !== 'object') {
    return data
  }

  for (const [sectionKey, sectionNode] of Object.entries(schema.properties)) {
    const sectionSchema = sectionNode as RJSFSchema | undefined

    if (!sectionSchema) {
      continue
    }

    if (sectionSchema.prepopulated === true) {
      if (sectionSchema.type === 'object') {
        if (data[sectionKey] === undefined) data[sectionKey] = {}
      } else if (sectionSchema.type === 'array') {
        if (data[sectionKey] === undefined) data[sectionKey] = []
      }
    }

    const sectionData =
      (data[sectionKey] as JSONObject | undefined) ??
      (sectionSchema.type === 'object' ? (data[sectionKey] = {}) : undefined)

    const sectionProps = sectionSchema.properties as
      | Record<string, RJSFSchema>
      | undefined

    if (!sectionProps || !sectionData || typeof sectionData !== 'object') {
      continue
    }

    for (const [fieldKey, fieldSchema] of Object.entries(sectionProps)) {
      if (fieldSchema.prepopulated === true) {
        if (fieldSchema.type === 'object') {
          if (!sectionData[fieldKey]) {
            sectionData[fieldKey] = {}
          }
        } else if (fieldSchema.type === 'array') {
          if (!sectionData[fieldKey]) {
            sectionData[fieldKey] = []
          }
        }
      }

      // Handle date prepopulation for dateTimeUtc
      if (
        sectionData[fieldKey] === undefined &&
        fieldSchema.prepopulatedWithTodaysDate === true &&
        fieldSchema.uiType === 'dateTimeUtc'
      ) {
        sectionData[fieldKey] = {
          date: todayISODate(),
          time: currentTimeHHMM(),
          utc: '',
        }
      }
    }
  }

  return data
}
