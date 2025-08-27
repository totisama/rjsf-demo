import type { RJSFSchema } from '@rjsf/utils'

export interface TableSchema extends RJSFSchema {
  uiType?: string
  xTableBehavior?: TableBehavior
}

export interface TableBehavior {
  mode?: 'columnsSum'
  fixedRows?: boolean
}
