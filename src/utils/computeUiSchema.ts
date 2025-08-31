import type { RJSFSchema, UiSchema } from '@rjsf/utils'

export function computeUiSchema(schema: RJSFSchema): UiSchema {
  const uiSchema: UiSchema = {}

  const visit = (node: RJSFSchema, path: string[] = []): void => {
    if (!node || typeof node !== 'object') return

    if (
      node.type === 'object' &&
      (node as { uiType?: string }).uiType === 'consumption'
    ) {
      setUiAtPath(uiSchema, path, {
        'ui:field': 'ConsumptionTable',
      })
    }

    if (node.type === 'object' && node.properties) {
      Object.entries(node.properties).forEach(([k, v]) => {
        if (v && typeof v === 'object') {
          visit(v as RJSFSchema, [...path, k])
        }
      })
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
