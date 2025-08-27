import { useState } from 'react'
import Form, { type IChangeEvent } from '@rjsf/core'
import validator from '@rjsf/validator-ajv6'
import type { RJSFSchema, UiSchema } from '@rjsf/utils'
import { FieldTemplate } from '../templates/field-template'
import { NumberBlurClearWidget } from '../widgets/number-blur-clear-widget'
import { TotalWidget } from '../widgets/total-widget'

export type Form1Values = {
  a?: number
  b?: number
  c?: number
  total?: number
}

const schema: RJSFSchema = {
  type: 'object',
  required: ['a', 'b'],
  properties: {
    a: { type: 'number', title: 'A' },
    b: { type: 'number', title: 'B' },
    c: { type: 'number', title: 'C' },
    total: { type: 'number', title: 'Total', readOnly: true },
  },
}

const uiSchema: UiSchema = {
  a: {
    'ui:widget': 'NumberBlurClear',
    'ui:options': { placeholder: 'Type a number' },
  },
  b: {
    'ui:widget': 'NumberBlurClear',
    'ui:options': { placeholder: 'Type a number' },
  },
  c: {
    'ui:widget': 'NumberBlurClear',
    'ui:options': { placeholder: 'Type a number' },
  },
  total: { 'ui:widget': 'TotalWidget', 'ui:disabled': true },
}

const defaultForm: Form1Values = {
  a: 0,
  b: 0,
  c: 0,
  total: 0,
}

export const FirstForm = () => {
  const [formData, setFormData] = useState<Form1Values>(defaultForm)

  const handleSubmit = (e: IChangeEvent) => {
    const data = e.formData as Form1Values
    console.log('Form submitted:', data)
  }

  return (
    <>
      <section style={{ maxWidth: 640, margin: '24px auto' }}>
        <h2>First Form</h2>

        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          validator={validator}
          templates={{
            FieldTemplate,
          }}
          widgets={{ NumberBlurClear: NumberBlurClearWidget, TotalWidget }}
          formContext={{ currentData: formData }}
          onChange={(e) => setFormData(e.formData as Form1Values)}
          onSubmit={handleSubmit}
          showErrorList={false}
        />
      </section>

      <DebugPanel data={formData} />
    </>
  )
}
