import { useState } from 'react'
import type { RJSFSchema } from '@rjsf/utils'
import { DynamicForm } from './dynamic-form'
import { ConsumptionTableField } from '../fields/consumption-table-field'
import { EmailWidget } from '../widgets/email-widget'
import { PositionField } from '../fields/position-field'
import { DateTimeUtcField } from '../fields/date-time-utc-field'
import { TextareaWidget } from '../widgets/textarea-widget'
import { RadioWidget } from '../widgets/radio-widget'
import { BunkerTableField } from '../fields/bunker-table-field'
import { SumTimeTotalField } from '../fields/sum-time-total-field'
import dailyAtSeaSchema from '../../mocks/dailyAtSeaSchema.json'
import { FullVoyageNumberField } from '../fields/full-voyage-number-field'

export const DailyAtSeaForm = () => {
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  const handleSubmit = (data: unknown) => {
    console.log('Form submitted:', data)
  }

  return (
    <div style={{ maxWidth: 960, margin: '24px auto', padding: 16 }}>
      <h2>Daily at Sea Form</h2>

      <DynamicForm
        schema={dailyAtSeaSchema as unknown as RJSFSchema}
        formData={formData}
        fields={{
          ConsumptionTable: ConsumptionTableField,
          DateTimeUtc: DateTimeUtcField,
          Position: PositionField,
          BunkerTable: BunkerTableField,
          SumTimeTotal: SumTimeTotalField,
          FullVoyageNumber: FullVoyageNumberField,
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
