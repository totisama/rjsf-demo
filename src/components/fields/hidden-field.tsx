import type { FieldProps } from '@rjsf/utils'

export const HiddenField: React.FC<FieldProps> = (props) =>
  (props.schema as { uiType?: string }).uiType ? null : props.children
