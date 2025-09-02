import type { RJSFSchema, UiSchema } from '@rjsf/utils'

export function computeUiSchema(schema: RJSFSchema): UiSchema {
  const uiSchema: UiSchema = {}

  const visit = (node: RJSFSchema, path: string[] = []): void => {
    if (!node || typeof node !== 'object') return

    const uiType = (node as { uiType?: string }).uiType

    if (uiType) {
      const leafUiSchema: UiSchema = {}

      switch (uiType) {
        case 'consumption':
          leafUiSchema['ui:field'] = 'ConsumptionTable'
          break

        case 'bunkerTable':
          leafUiSchema['ui:field'] = 'BunkerTable'
          break

        case 'dateTimeUtc':
          leafUiSchema['ui:field'] = 'DateTimeUtc'
          break

        case 'position':
          leafUiSchema['ui:field'] = 'Position'
          break

        case 'section':
          leafUiSchema['ui:field'] = 'Section'
          break

        case 'radio':
          leafUiSchema['ui:widget'] = 'RadioPills'
          break

        case 'email':
          leafUiSchema['ui:widget'] = 'Email'
          break

        case 'remarks':
          leafUiSchema['ui:widget'] = 'Textarea'
          break
      }

      if (Object.keys(leafUiSchema).length > 0) {
        setUiAtPath(uiSchema, path, leafUiSchema)
      }
    }

    if (node.type === 'object' && node.properties) {
      Object.entries(node.properties).forEach(
        ([propertyKey, propertySchema]) => {
          if (propertySchema && typeof propertySchema === 'object') {
            visit(propertySchema as RJSFSchema, [...path, propertyKey])
          }
        }
      )
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
