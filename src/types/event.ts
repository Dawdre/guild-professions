export interface EventData {
  parse_number: number
  parse_total: number
  message: string
}

export interface Found {
  found: boolean
  message: string
}

export interface EventProgress {
  characterEventData: EventData
  parseEventData: EventData
  foundCheck: Found
  cacheCheck: string
  statusText: string
  progressText: string
  isLoading: boolean
}