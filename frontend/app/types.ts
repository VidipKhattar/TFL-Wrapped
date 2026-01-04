/**
 * Type definitions for TFL Wrapped data structures.
 * Matches the JSON schema returned by the FastAPI backend.
 */

export interface WrappedData {
  summary: {
    total_journeys: number
    total_spent: number
    average_cost: number
    average_spend_per_day: number
    days_covered: number
    capped_journeys: number
    non_capped_journeys: number
    total_time_minutes: number
  }
  top_routes: Array<{
    route: string
    count: number
  }>
  top_origins: Array<{
    location: string
    count: number
  }>
  top_destinations: Array<{
    location: string
    count: number
  }>
  journey_types: Array<{
    type: string
    count: number
  }>
  daily_spending: Array<{
    date: string
    amount: number
  }>
  hourly_pattern: Array<{
    hour: number
    count: number
  }>
  most_expensive_journey: {
    route: string
    date: string
    cost: number
  }
  busiest_day: {
    date: string
    journey_count: number
  }
  top_lines: Array<{
    line: string
    count: number
  }>
  confidence_breakdown: {
    high: number
    medium: number
    low: number
  }
  line_inference_note: string
}

