import { useState } from 'react'
import Form, { type IChangeEvent } from '@rjsf/core'
import validator from '@rjsf/validator-ajv6'
import type { RJSFSchema, UiSchema } from '@rjsf/utils'
import { FieldTemplate } from '../templates/field-template'
import { TableField } from '../fields/table-field'
import type { TableSchema } from '../../types'

type Form2Values = {
  text1?: string
  text2?: string
  text3?: string
  num1?: number
  num2?: number
  table1?: Array<{ c1: number; c2: number; c3: number; c4: number; c5: number }>
}

const table1: RJSFSchema & {
  uiType?: string
} = {
  uiType: 'table',
  type: 'array',
  minItems: 1,
  items: {
    title: 'Table 1',
    type: 'object',
    required: ['c1', 'c2', 'c3', 'c4', 'c5'],
    properties: {
      c1: { type: 'number', title: 'C1', minimum: 0 },
      c2: { type: 'number', title: 'C2', minimum: 0 },
      c3: { type: 'number', title: 'C3', minimum: 0 },
      c4: { type: 'number', title: 'C4', minimum: 0 },
      c5: { type: 'number', title: 'C5', minimum: 0 },
    },
  },
}

const table2: TableSchema = {
  uiType: 'table',
  type: 'array',
  minItems: 1,
  items: {
    title: 'Table 2',
    type: 'object',
    required: ['c1', 'c2', 'c3', 'c4', 'c5'],
    properties: {
      c1: { type: 'number', title: 'C1', minimum: -25, maximum: -5 },
      c2: { type: 'number', title: 'C2', minimum: -25, maximum: -5 },
      c3: { type: 'number', title: 'C3', minimum: -25, maximum: -5 },
      c4: { type: 'number', title: 'C4', minimum: -25, maximum: -5 },
      c5: { type: 'number', title: 'C5', minimum: -25, maximum: -5 },
    },
  },
}

const schema: RJSFSchema = {
  title: 'Second Form',
  type: 'object',
  properties: {
    basic: {
      type: 'object',
      title: 'Basic Fields',
      properties: {
        text1: { type: 'string', title: 'Text 1' },
        text2: { type: 'string', title: 'Text 2' },
        text3: { type: 'string', title: 'Text 3' },
        num1: { type: 'number', title: 'Number 1' },
        num2: { type: 'number', title: 'Number 2' },
      },
    },
    table1,
    table2,
  },
}

const uiSchema: UiSchema = {
  text1: { 'ui:placeholder': 'Enter something...' },
  text2: { 'ui:placeholder': 'Enter something...' },
  text3: { 'ui:placeholder': 'Enter something...' },
  num1: { 'ui:placeholder': 'Enter a number...' },
  num2: { 'ui:placeholder': 'Enter a number...' },

  table1: {
    'ui:field': 'TableField',
    'ui:options': {
      columnLabels: ['C1', 'C2', 'C3', 'C4', 'C5'],
    },
  },
  table2: {
    'ui:field': 'TableField',
    'ui:options': {
      columnLabels: ['C1', 'C2', 'C3', 'C4', 'C5'],
    },
  },
}

export const SecondForm = () => {
  const [formData, setFormData] = useState<Form2Values>({})

  const handleSubmit = (e: IChangeEvent) => {
    const data = e.formData as Form2Values
    console.log('Form submitted:', data)
  }

  return (
    <>
      <section style={{ maxWidth: 760, margin: '24px auto' }}>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          validator={validator}
          templates={{ FieldTemplate }}
          fields={{ TableField }}
          showErrorList={false}
          onChange={(e) => setFormData(e.formData as Form2Values)}
          onSubmit={handleSubmit}
        />
      </section>
      <pre
        style={{
          padding: 12,
          marginTop: 12,
          background: '#0f172a',
          color: '#e2e8f0',
          borderRadius: 15,
          position: 'absolute',
          top: 24,
          left: 24,
        }}
      >
        {JSON.stringify(formData, null, 2)}
      </pre>
    </>
  )
}
