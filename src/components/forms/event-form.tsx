import { useState } from 'react'
import type { RJSFSchema } from '@rjsf/utils'
import eventSchema from '../../mocks/eventSchema.json'
import { DynamicForm } from './dynamic-form'
import { ConsumptionTableField } from '../fields/consumption-table-field'
import { EmailWidget } from '../widgets/email-widget'
import { PositionField } from '../fields/position-field'
import { DateTimeUtcField } from '../fields/date-time-utc-field'
import { TextareaWidget } from '../widgets/textarea-widget'
import { RadioWidget } from '../widgets/radio-widget'
import { BunkerTableField } from '../fields/bunker-table-field'

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
        fields={{
          ConsumptionTable: ConsumptionTableField,
          DateTimeUtc: DateTimeUtcField,
          Position: PositionField,
          BunkerTable: BunkerTableField,
        }}
        widgets={{
          Email: EmailWidget,
          Radio: RadioWidget,
          Textarea: TextareaWidget,
        }}
        onChange={(data) => setFormData(data as Record<string, unknown>)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
