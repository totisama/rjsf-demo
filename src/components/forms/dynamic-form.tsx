import Form, { type IChangeEvent } from '@rjsf/core'
import validator from '@rjsf/validator-ajv6'
import type {
  RegistryFieldsType,
  RegistryWidgetsType,
  RJSFSchema,
} from '@rjsf/utils'
import { computeUiSchema } from '../../utils/computeUiSchema'
import { HiddenField } from '../fields/hidden-field'
import { ErrorListTemplate } from '../templates/error-list-template'
import { FieldTemplateNoError } from '../templates/field-template-no-error'

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
  const uiSchema = computeUiSchema(schema as RJSFSchema)

  return (
    <Form
      formData={formData}
      schema={schema}
      uiSchema={uiSchema}
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
      onChange={(e: IChangeEvent) => onChange?.(e.formData)}
      onSubmit={(e: IChangeEvent) => onSubmit?.(e.formData)}
    />
  )
}
