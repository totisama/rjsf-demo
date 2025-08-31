import { useState } from 'react'
import type { RJSFSchema } from '@rjsf/utils'
import eventSchema from '../../eventSchema.json'
import { DynamicForm } from './dynamic-form'
import { ConsumptionTableField } from '../fields/consumption-table-field'
import { DebugPanel } from '../debug-panel'

export const EventForm = () => {
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  const handleSubmit = (data: unknown) => {
    console.log('Form submitted:', data)
  }

  return (
    <div style={{ maxWidth: 960, margin: '24px auto', padding: 16 }}>
      <h2>Event Form</h2>

      <DynamicForm
        schema={eventSchema as unknown as RJSFSchema}
        formData={formData}
        fields={{ ConsumptionTable: ConsumptionTableField }}
        onChange={(data) => setFormData(data as Record<string, unknown>)}
        onSubmit={handleSubmit}
      />

      <DebugPanel data={formData} />
    </div>
  )
}
