import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatDialogModule, MatDialog } from "@angular/material/dialog"
import { MatChipsModule } from "@angular/material/chips"
import { MatMenuModule } from "@angular/material/menu"
import { MatBadgeModule } from "@angular/material/badge"
import { MatTooltipModule } from "@angular/material/tooltip"
import { DragDropModule, type CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop"
import { TrelloService } from "../../core/services/trello.service"
import { LoadingService } from "../../core/services/loading.service"
import { CreateCardDialogComponent } from "../../shared/components/create-card-dialog/create-card-dialog.component"
import { EditCardDialogComponent } from "../../shared/components/edit-card-dialog/edit-card-dialog.component"
import { TrelloBoard, TrelloCard, TrelloList } from "../../core/models/trello.model"

interface ListWithCards {
  list: TrelloList
  cards: TrelloCard[]
}

@Component({
  selector: "app-board",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    DragDropModule,
  ],
  templateUrl: "./board.component.html",
  styleUrl: "./board.component.scss"
})
export class BoardComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private trelloService = inject(TrelloService)
  private dialog = inject(MatDialog)

  loadingService = inject(LoadingService)
  board: TrelloBoard | null = null
  listsWithCards: ListWithCards[] = []
  boardId = ""

  ngOnInit() {
    this.boardId = this.route.snapshot.paramMap.get("id") || ""
    this.loadBoard()
  }

  loadBoard() {
    this.loadingService.setLoading(true)

    this.trelloService.getBoard(this.boardId).subscribe({
      next: (board) => {
        console.log("Board loaded:", board)
        this.board = board || null
        this.loadLists()
      },
      error: (error) => {
        console.error("Error loading board:", error)
        this.loadingService.setLoading(false)
      },
    })
  }

  loadLists() {
    this.trelloService.getLists(this.boardId).subscribe({
      next: (lists) => {
        this.loadCardsForLists(lists)
      },
      error: (error) => {
        console.error("Error loading lists:", error)
        this.loadingService.setLoading(false)
      },
    })
  }

  loadCardsForLists(lists: TrelloList[]) {
    const listPromises = lists.map((list) =>
      this.trelloService
        .getCards(list.id)
        .toPromise()
        .then((cards) => ({
          list,
          cards: cards || [],
        })),
    )

    Promise.all(listPromises)
      .then((listsWithCards) => {
        this.listsWithCards = listsWithCards
        this.loadingService.setLoading(false)
      })
      .catch((error) => {
        console.error("Error loading cards:", error)
        this.loadingService.setLoading(false)
      })
  }

  getConnectedLists(): string[] {
    return this.listsWithCards.map((lwc) => lwc.list.id)
  }

  drop(event: CdkDragDrop<TrelloCard[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
    } else {
      const card = event.previousContainer.data[event.previousIndex]
      const newListId = this.getListIdFromContainer(event.container)

      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex)

      this.trelloService.moveCard(card.id, newListId, event.currentIndex).subscribe({
        next: (updatedCard) => {
          console.log("Card moved successfully:", updatedCard)
        },
        error: (error) => {
          console.error("Error moving card:", error)
          transferArrayItem(event.container.data, event.previousContainer.data, event.currentIndex, event.previousIndex)
        },
      })
    }
  }

  private getListIdFromContainer(container: any): string {
    const listWithCards = this.listsWithCards.find((lwc) => lwc.cards === container.data)
    return listWithCards?.list.id || ""
  }

  addCard(listId: string) {
    const dialogRef = this.dialog.open(CreateCardDialogComponent, {
      width: "500px",
      data: { listId },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trelloService.createCard(listId, result.name, result.description).subscribe({
          next: (newCard) => {
            const listWithCards = this.listsWithCards.find((lwc) => lwc.list.id === listId)
            if (listWithCards) {
              listWithCards.cards.push(newCard)
            }
          },
          error: (error) => {
            console.error("Error creating card:", error)
          },
        })
      }
    })
  }

  editCard(card: TrelloCard) {
    const dialogRef = this.dialog.open(EditCardDialogComponent, {
      width: "600px",
      data: { card },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trelloService.updateCard(card.id, result).subscribe({
          next: (updatedCard) => {
            const listWithCards = this.listsWithCards.find((lwc) => lwc.cards.some((c) => c.id === card.id))
            if (listWithCards) {
              const cardIndex = listWithCards.cards.findIndex((c) => c.id === card.id)
              if (cardIndex !== -1) {
                listWithCards.cards[cardIndex] = updatedCard
              }
            }
          },
          error: (error) => {
            console.error("Error updating card:", error)
          },
        })
      }
    })
  }

  goBack() {
    this.router.navigate(["/dashboard"])
  }

  viewAnalytics() {
    this.router.navigate(["/analytics", this.boardId])
  }

  getTotalCards(): number {
    return this.listsWithCards.reduce((total, lwc) => total + lwc.cards.length, 0)
  }

  getListBadgeClass(cardCount: number): string {
    if (cardCount === 0) return "bg-slate-100 text-slate-600"
    if (cardCount <= 3) return "bg-emerald-100 text-emerald-700"
    if (cardCount <= 6) return "bg-blue-100 text-blue-700"
    return "bg-amber-100 text-amber-700"
  }

  getLabelColor(color: string): string {
    const colorMap: { [key: string]: string } = {
      green: "#10b981",
      yellow: "#f59e0b",
      orange: "#f97316",
      red: "#ef4444",
      purple: "#8b5cf6",
      blue: "#3b82f6",
      sky: "#0ea5e9",
      lime: "#84cc16",
      pink: "#ec4899",
      black: "#374151",
    }
    return colorMap[color] || "#6b7280"
  }

  getContrastColor(color: string): string {
    const darkColors = ["black", "blue", "purple", "green"]
    return darkColors.includes(color) ? "#ffffff" : "#1f2937"
  }

  getDueDateClass(dueDate: string): string {
    const date = new Date(dueDate)
    const now = new Date()
    const isOverdue = date < now
    const isToday = date.toDateString() === now.toDateString()
    
    if (isOverdue) return "text-red-600"
    if (isToday) return "text-amber-600"
    return "text-slate-500"
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  formatDueDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const isOverdue = date < now
    const isToday = date.toDateString() === now.toDateString()

    if (isOverdue) return "Vencida"
    if (isToday) return "Hoy"
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    })
  }
}