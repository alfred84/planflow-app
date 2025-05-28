import { Component, type OnInit, inject, signal } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatTabsModule } from "@angular/material/tabs"
import { MatChipsModule } from "@angular/material/chips"
import { MatDividerModule } from "@angular/material/divider"
import { MatTooltipModule } from "@angular/material/tooltip"
import { MatBadgeModule } from "@angular/material/badge"
import { TrelloService, type TrelloBoard, type TrelloList, type TrelloCard } from "../../core/services/trello.service"
import { AIService, type AIAnalysis } from "../../core/services/ai.service"
import { LoadingService } from "../../core/services/loading.service"
import { BoardMetrics } from "../../core/models/board-metrics.interface"

@Component({
  selector: "app-analytics",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.scss"],
})
export class AnalyticsComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private trelloService = inject(TrelloService)
  private aiService = inject(AIService)

  loadingService = inject(LoadingService)
  board: TrelloBoard | null = null
  metrics: BoardMetrics | null = null
  aiAnalysis: AIAnalysis | null = null
  aiAnalysisLoading = false
  boardId = ""

  aiAnalysisSummary = signal<string[]>([])
  // aiAnalysisSummary = ''

  ngOnInit() {
    this.boardId = this.route.snapshot.paramMap.get("id") || ""
    this.loadAnalytics()
  }

  loadAnalytics() {
    this.loadingService.setLoading(true)

    // Load board details
    this.trelloService.getBoard(this.boardId).subscribe({
      next: (board) => {
        this.board = board || null
        this.calculateMetrics()
      },
      error: (error) => {
        console.error("Error loading board:", error)
        this.loadingService.setLoading(false)
      },
    })
  }

  calculateMetrics() {
    this.trelloService.getAllCardsForBoard(this.boardId).subscribe({
      next: (cards) => {
        this.trelloService.getLists(this.boardId).subscribe({
          next: (lists) => {
            this.metrics = this.computeMetrics(cards, lists)
            this.loadingService.setLoading(false)
          },
          error: (error) => {
            console.error("Error loading lists:", error)
            this.loadingService.setLoading(false)
          },
        })
      },
      error: (error) => {
        console.error("Error loading cards:", error)
        this.loadingService.setLoading(false)
      },
    })
  }

  computeMetrics(cards: TrelloCard[], lists: TrelloList[]): BoardMetrics {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Identify list types
    const doneList = lists.find(
      (l) =>
        l.name.toLowerCase().includes("done") ||
        l.name.toLowerCase().includes("completed") ||
        l.name.toLowerCase().includes("finished"),
    )
    const doingList = lists.find(
      (l) =>
        l.name.toLowerCase().includes("doing") ||
        l.name.toLowerCase().includes("progress") ||
        l.name.toLowerCase().includes("development"),
    )
    const todoList = lists.find(
      (l) =>
        l.name.toLowerCase().includes("todo") ||
        l.name.toLowerCase().includes("to do") ||
        l.name.toLowerCase().includes("backlog"),
    )

    const completedCards = doneList ? cards.filter((c) => c.idList === doneList.id).length : 0
    const inProgressCards = doingList ? cards.filter((c) => c.idList === doingList.id).length : 0
    const todoCards = todoList ? cards.filter((c) => c.idList === todoList.id).length : 0

    const overdueCards = cards.filter((c) => c.due && new Date(c.due) < now && !c.closed).length

    const inactiveCards = cards.filter((c) => new Date(c.dateLastActivity) < weekAgo && !c.closed).length

    // Calculate average completion time (mock calculation)
    const averageCompletionTime = completedCards > 0 ? Math.round(Math.random() * 10 + 3) : 0

    return {
      totalCards: cards.length,
      completedCards,
      inProgressCards,
      todoCards,
      overdueCards,
      averageCompletionTime,
      inactiveCards,
    }
  }

  generateAIAnalysis() {
    if (!this.board) return

    this.aiAnalysisLoading = true

    this.trelloService.getLists(this.boardId).subscribe({
      next: (lists) => {
        this.trelloService.getAllCardsForBoard(this.boardId).subscribe({
          next: (cards) => {
            this.aiService.analyzeBoard(this.board!, lists, cards).subscribe({
              next: (analysis) => {
                this.aiAnalysis = analysis
                this.aiAnalysisLoading = false
                this.aiService.sendPrompt(this.board!, lists, cards).subscribe({
                  next: (response) => {
                    const answer = response.choices[0].message.content || "No summary available."
                    const recomendaciones = answer.split(/\n?\d+\.\s+/).map((r: string) => r.trim()).filter((r: string) => r && !r.toLowerCase().startsWith('ai analysis summary'));
                    this.aiAnalysisSummary.set(recomendaciones)
                    console.log("AI analysis summary:", this.aiAnalysisSummary())
                  },error: (error) => {
                      console.error("Error sending AI prompt:", error)
                      this.aiAnalysisLoading = false
                    }, 
                  }) 
                console.log("AI analysis generated:", analysis)
              },
              error: (error) => {
                console.error("Error generating AI analysis:", error)
                this.aiAnalysisLoading = false
              },
            })
          },
          error: (error) => {
            console.error("Error loading cards for AI analysis:", error)
            this.aiAnalysisLoading = false
          },
        })
      },
      error: (error) => {
        console.error("Error loading lists for AI analysis:", error)
        this.aiAnalysisLoading = false
      },
    })
  }

  refreshAnalytics() {
    this.aiAnalysis = null
    this.loadAnalytics()
  }

  getCompletionRate(): number {
    if (!this.metrics || this.metrics.totalCards === 0) return 0
    return Math.round((this.metrics.completedCards / this.metrics.totalCards) * 100)
  }

  getPercentage(value: number): number {
    if (!this.metrics || this.metrics.totalCards === 0) return 0
    return Math.round((value / this.metrics.totalCards) * 100)
  }

  goBack() {
    this.router.navigate(["/board", this.boardId])
  }

}