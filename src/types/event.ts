export interface EventData {
  parse_number: number
  parse_total: number
  message: string
}

export interface EventProgress {
  characterEventData: EventData
  parseEventData: EventData,
  statusText: string
  loadingText: string
}