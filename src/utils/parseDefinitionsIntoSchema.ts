import type { RJSFSchema } from '@rjsf/utils'

const clone = <T>(x: T): T =>
  x == null || typeof x !== 'object' ? x : JSON.parse(JSON.stringify(x))

function resolveRef($ref: string, root: RJSFSchema): RJSFSchema {
  const path = $ref.replace(/^#\//, '').split('/')
  let current: unknown = root

  for (const segment of path) {
    if (typeof current === 'object' && current !== null && segment in current) {
      current = current[segment as keyof typeof current]
    } else {
      throw new Error(`Could not resolve ${$ref}`)
    }
  }

  return current as RJSFSchema
}

export function parseDefinitionsIntoSchema(
  schema: RJSFSchema,
  root: RJSFSchema = schema
): RJSFSchema {
  if (!schema || typeof schema !== 'object') {
    return schema
  }

  let node: RJSFSchema = clone(schema)

  if ('$ref' in node && typeof node.$ref === 'string') {
    const resolved = clone(resolveRef(node.$ref, root))

    node = { ...resolved, ...node }
    delete node.$ref
  }

  if (node.properties && typeof node.properties === 'object') {
    const updatedProps: Record<string, RJSFSchema> = {}

    for (const [key, value] of Object.entries(node.properties)) {
      if (value && typeof value === 'object') {
        updatedProps[key] = parseDefinitionsIntoSchema(
          value as RJSFSchema,
          root
        )
      }
    }

    node.properties = updatedProps
  }

  if (node.items && typeof node.items === 'object') {
    node.items = parseDefinitionsIntoSchema(node.items as RJSFSchema, root)
  }

  return node
}
