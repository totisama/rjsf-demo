import type { RJSFSchema, UiSchema } from '@rjsf/utils'

export function computeUiSchema(schema: RJSFSchema): UiSchema {
  const uiSchema: UiSchema = {}

  const visit = (node: RJSFSchema, path: string[] = []): void => {
    if (!node || typeof node !== 'object') return

    const uiType = (node as { uiType?: string }).uiType
    const sumTimeFormula = (node as { sumTimeFormula?: unknown }).sumTimeFormula
    const leafUiSchema: UiSchema = {}

    if (uiType) {
      switch (uiType) {
        case 'consumption':
          leafUiSchema['ui:field'] = 'ConsumptionTable'
          break
        case 'utilizationTable':
          break
        case 'bunkerTable':
          leafUiSchema['ui:field'] = 'BunkerTable'
          break
        case 'tankSummaryTable':
          break

        case 'dateTimeUtc':
          leafUiSchema['ui:field'] = 'DateTimeUtc'
          break
        case 'ETADateTimeUtc':
          break
        case 'time':
          break

        case 'position':
          leafUiSchema['ui:field'] = 'Position'
          break

        case 'section':
        case 'conditionalSection':
        case 'additionalSection':
          break

        case 'radio':
          leafUiSchema['ui:widget'] = 'Radio'
          break
        case 'checkbox':
          break
        case 'email':
          leafUiSchema['ui:widget'] = 'Email'
          break
        case 'remarks':
        case 'textarea':
          leafUiSchema['ui:widget'] = 'Textarea'
          break

        case 'fullVoyageNumber':
          break
        case 'percentageOf':
        case 'requiredSpeed':
        case 'speedCalculator':
        case 'timeDifference':
        case 'totalAeRunning':
        case 'oneLine':
        case 'calculated':
          leafUiSchema['ui:readonly'] = true
          break

        case 'port':
          break
      }
    }

    if (typeof sumTimeFormula === 'string') {
      leafUiSchema['ui:field'] = 'SumTimeTotal'
    }

    if (Object.keys(leafUiSchema).length > 0) {
      setUiAtPath(uiSchema, path, leafUiSchema)
    }

    if (node.type === 'object' && node.properties) {
      for (const [propertyKey, propertySchema] of Object.entries(
        node.properties
      )) {
        if (propertySchema && typeof propertySchema === 'object') {
          visit(propertySchema as RJSFSchema, [...path, propertyKey])
        }
      }
    }

    if (node.type === 'array' && node.items && typeof node.items === 'object') {
      visit(node.items as RJSFSchema, [...path, 'items'])
    }
  }

  visit(schema)
  return uiSchema
}

function setUiAtPath(
  baseUiSchema: UiSchema,
  path: string[],
  leafUiSchema: UiSchema
): void {
  let currentLevel: UiSchema = baseUiSchema

  for (const segment of path) {
    if (!currentLevel[segment]) {
      currentLevel[segment] = {}
    }

    currentLevel = currentLevel[segment]
  }

  Object.assign(currentLevel, leafUiSchema)
}
