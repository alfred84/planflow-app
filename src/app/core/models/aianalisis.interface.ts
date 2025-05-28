export interface AIAnalysis {
  workflowSuggestions: string[]
  priorityTasks: string[]
  bottlenecks: string[]
  recommendations: string[]
  productivity: {
    score: number
    trend: "up" | "down" | "stable"
    insights: string[]
  }
}