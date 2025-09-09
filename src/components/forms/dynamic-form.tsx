import { useEffect, useMemo, useState } from 'react'
import Form, { type IChangeEvent } from '@rjsf/core'
import validator from '@rjsf/validator-ajv6'
import type {
  RegistryFieldsType,
  RegistryWidgetsType,
  RJSFSchema,
  UiSchema,
} from '@rjsf/utils'
import { computeUiSchema } from '../../utils/computeUiSchema'
import { HiddenField } from '../fields/hidden-field'
import { ErrorListTemplate } from '../templates/error-list-template'
import { FieldTemplateNoError } from '../templates/field-template-no-error'
import { parseDefinitionsIntoSchema } from '../../utils/parseDefinitionsIntoSchema'
import { updateSchema } from '../../utils/updateSchema'
import type { JSONObject } from '../../types'

type DynamicFormProps = {
  schema: RJSFSchema
  formData?: unknown
  fields?: RegistryFieldsType
  widgets?: RegistryWidgetsType
  onChange?: (data: unknown) => void
  onSubmit?: (data: unknown) => void
}

const extraFields: RegistryFieldsType = {
  AnyOfField: HiddenField,
  MultiSchemaField: HiddenField,
}

export const DynamicForm = ({
  schema,
  formData,
  onChange,
  onSubmit,
  fields,
  widgets,
}: DynamicFormProps) => {
  const parsedSchema = useMemo(
    () => parseDefinitionsIntoSchema(schema),
    [schema]
  )
  const [dynamicSchema, setDynamicSchema] = useState<RJSFSchema>(parsedSchema)
  const [dynamicUiSchema, setDynamicUiSchema] = useState<UiSchema>(() =>
    computeUiSchema(parsedSchema)
  )

  const handleChange = (e: IChangeEvent) => {
    const formDataRaw = (e.formData ?? {}) as JSONObject
    const { schema: updatedSchema, formData: cleaned } = updateSchema(
      parsedSchema,
      formDataRaw
    )
    setDynamicSchema(updatedSchema)
    setDynamicUiSchema(computeUiSchema(updatedSchema))

    onChange?.(cleaned)
  }

  useEffect(() => {
    const dataObj = (formData ?? {}) as JSONObject
    const { schema: updatedSchema, formData: cleaned } = updateSchema(
      parsedSchema,
      dataObj
    )
    setDynamicSchema(updatedSchema)
    setDynamicUiSchema(computeUiSchema(updatedSchema))
  }, [parsedSchema, formData])

  return (
    <Form
      formData={formData}
      schema={dynamicSchema}
      uiSchema={dynamicUiSchema}
      validator={validator}
      fields={{ ...fields, ...extraFields }}
      widgets={{ ...widgets }}
      templates={{
        FieldTemplate: FieldTemplateNoError,
        ErrorListTemplate,
      }}
      experimental_defaultFormStateBehavior={{
        emptyObjectFields: 'skipEmptyDefaults',
        constAsDefaults: 'skipOneOf',
      }}
      showErrorList="bottom"
      onChange={handleChange}
      onSubmit={(e: IChangeEvent) => onSubmit?.(e.formData)}
    />
  )
}
