import type { RJSFSchema } from '@rjsf/utils'

export interface TableSchema extends RJSFSchema {
  uiType?: string
  xTableBehavior?: TableBehavior
}

export interface TableBehavior {
  mode?: 'columnsSum'
  fixedRows?: boolean
}

export type Priority = 'low' | 'medium' | 'high'

export type Row = Record<string, number | undefined>

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [k: string]: JSONValue }

export type JSONObject = { [k: string]: JSONValue }
