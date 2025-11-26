export interface TrendingTopic {
  id: string
  text: string
  count: number
  sparkline: number[]
}

export interface TrendingTopicsResponse {
  timespan: string
  topics: TrendingTopic[]
}

// Focus Mode - detailed stats for a single topic
export interface TopicDetails {
  id: string
  text: string
  count: number
  sparkline: number[]
  sparklineLabels: string[] // Time labels for each sparkline point
  previousPeriodCount: number // Count from the previous equivalent period for comparison
  changePercent: number // Percentage change from previous period
}

export interface TopicDetailsResponse {
  timespan: string
  topic: TopicDetails
}
