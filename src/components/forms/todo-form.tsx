import { useState } from 'react'
import Form from '@rjsf/core'
import validator from '@rjsf/validator-ajv6'
import type { RJSFSchema, UiSchema } from '@rjsf/utils'
import type { IChangeEvent } from '@rjsf/core'
import { FieldTemplate } from '../templates/field-template'
import { TitleCounterWidget } from '../widgets/title-counter-widget'
import { SmartDateWidget } from '../widgets/smart-date-widget'
import { EstimateHoursWidget } from '../widgets/estimate-hours-widget'
import { PriorityWidget } from '../widgets/priority-widget'
import { KeyValueField } from '../fields/key-value-field'
import { colors } from '../../constants'
import { DebugPanel } from '../debug-panel'
import type { Priority } from '../../types'

interface TodoFormValues {
  title: string
  priority: Priority
  done: boolean
  estimate?: number
  dueDate?: string
  completedAt?: string
  extra?: Record<string, string>
}

const schema: RJSFSchema = {
  type: 'object',
  required: ['title', 'priority'],
  properties: {
    title: { type: 'string', title: 'Title', minLength: 2, maxLength: 15 },
    estimate: {
      type: 'number',
      title: 'Estimate (hours)',
      minimum: 0,
      maximum: 40,
    },
    priority: {
      type: 'string',
      title: 'Priority',
      enum: ['low', 'medium', 'high'],
    },
    extra: {
      type: 'object',
      title: 'Extra fields',
      additionalProperties: { type: 'string' },
    },
    done: { type: 'boolean', title: 'Done' },
  },
  dependencies: {
    done: {
      oneOf: [
        {
          properties: {
            done: { const: false },
            dueDate: {
              type: 'string',
              format: 'date',
              title: 'Due date',
            },
          },
          required: ['dueDate'],
        },
        {
          properties: {
            done: { const: true },
            completedAt: {
              type: 'string',
              format: 'date',
              title: 'Completed at',
            },
          },
          required: ['completedAt'],
        },
      ],
    },
  },
}

const uiSchema: UiSchema = {
  title: {
    'ui:widget': 'TitleCounter',
    'ui:options': { placeholder: 'Placeholder…', max: 15 },
  },
  dueDate: { 'ui:widget': 'SmartDate' },
  completedAt: { 'ui:widget': 'SmartDate' },
  priority: {
    'ui:widget': 'PriorityWidget',
    'ui:enumNames': ['Low', 'Medium', 'High'],
  },
  estimate: {
    'ui:widget': 'EstimateHours',
    'ui:options': { min: 0, max: 40, step: 1 },
  },
  extra: {
    'ui:field': 'KeyValue',
    'ui:options': { prefix: 'field' },
  },
}

const defaultForm: TodoFormValues = {
  title: '',
  priority: 'medium',
  done: false,
  estimate: 4,
}

export const TodoForm = () => {
  const [formData, setFormData] = useState<TodoFormValues>(defaultForm)
  const [todos, setTodos] = useState<
    Array<TodoFormValues & { id: string; createdAt: string }>
  >([])

  const handleSubmit = (event: IChangeEvent) => {
    const data = event.formData as TodoFormValues
    const id = crypto.randomUUID()

    const newTodo = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    }

    setTodos((prev) => [newTodo, ...prev])
    setFormData(defaultForm)
  }

  return (
    <>
      <section style={{ maxWidth: 640, margin: '24px auto' }}>
        <h2>TODO Form</h2>

        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          validator={validator}
          widgets={{
            TitleCounter: TitleCounterWidget,
            SmartDate: SmartDateWidget,
            EstimateHours: EstimateHoursWidget,
            PriorityWidget: PriorityWidget,
          }}
          fields={{
            KeyValue: KeyValueField,
          }}
          templates={{
            FieldTemplate,
          }}
          showErrorList={false}
          onChange={(e) => setFormData(e.formData ?? {})}
          onSubmit={handleSubmit}
          onError={(errors) => console.log('Form errors', errors)}
        />
      </section>
      <section style={{ width: '100%', maxWidth: 'none' }}>
        <h3 style={{ marginTop: 24 }}>Todos ({todos.length})</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 12,
            marginTop: 8,
          }}
        >
          {todos.map((todo) => {
            const c = colors[todo.priority]

            return (
              <div
                key={todo.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 12,
                  background: '#fff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    justifyContent: 'space-between',
                  }}
                >
                  <strong style={{ fontSize: 16, color: 'black' }}>
                    {todo.title || '(untitled)'}
                  </strong>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: 999,
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      color: c.text,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {todo.priority}
                  </span>
                </div>

                <div style={{ marginTop: 8, fontSize: 13, color: '#475569' }}>
                  <div>
                    <b>Status:</b> {todo.done ? 'Done' : 'Pending'}
                  </div>
                  {'dueDate' in todo && todo.dueDate && (
                    <div>
                      <b>Due:</b> {todo.dueDate}
                    </div>
                  )}
                  {'completedAt' in todo && todo.completedAt && (
                    <div>
                      <b>Completed:</b> {todo.completedAt}
                    </div>
                  )}
                  {'estimate' in todo && typeof todo.estimate === 'number' && (
                    <div>
                      <b>Estimate:</b> {todo.estimate}h
                    </div>
                  )}
                  <div>
                    <b>Created:</b> {new Date(todo.createdAt).toLocaleString()}
                  </div>
                </div>

                {todo.extra && Object.keys(todo.extra).length > 0 && (
                  <div style={{ marginTop: 8, color: 'black' }}>
                    <div
                      style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}
                    >
                      Extra
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {Object.entries(todo.extra).map(([key, value]) => (
                        <span
                          key={key}
                          style={{
                            padding: '2px 8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: 999,
                            fontSize: 12,
                          }}
                        >
                          <b>{key}:</b> {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <DebugPanel data={formData} />
    </>
  )
}
