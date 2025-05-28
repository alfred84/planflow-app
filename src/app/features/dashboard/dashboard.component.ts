import { Component, type OnInit, inject, signal } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatDialogModule, MatDialog } from "@angular/material/dialog"
import { MatGridListModule } from "@angular/material/grid-list"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"
import { MatChipsModule } from "@angular/material/chips"
import { MatTooltipModule } from "@angular/material/tooltip"
import { MatRippleModule } from "@angular/material/core"
import { FormsModule } from "@angular/forms"

import { LoadingService } from "../../core/services/loading.service"
import { CreateBoardDialogComponent } from "../../shared/components/create-board-dialog/create-board-dialog.component"
import { TrelloService } from "../../core/services/trello.service"
import { TrelloBoard } from "../../core/models/trello.model"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatRippleModule,
    FormsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'  
})
export class DashboardComponent implements OnInit {
  private trelloService = inject(TrelloService)
  private router = inject(Router)
  private dialog = inject(MatDialog)
  private snackBar = inject(MatSnackBar)

  loadingService = inject(LoadingService)
  boards: TrelloBoard[] = []
  searchQuery = ""
  filteredBoards = signal<TrelloBoard[]>([])

  ngOnInit() {
    this.loadBoards()
  }

  loadBoards() {
    const token = localStorage.getItem('trello_token');
    const apiKey = localStorage.getItem('trello_api_key');

    if (token && apiKey) {
      console.log('Token de Trello:', token);

      this.trelloService.getBoards(apiKey, token).subscribe({
        next: (boards) => {
          this.boards = boards
          this.filteredBoards.set(boards)
          this.loadingService.setLoading(false)
        },
        error: (error) => {
          console.error("Error loading boards:", error)
          this.snackBar.open("Error al cargar los tableros", "Cerrar", {
            duration: 3000,
            panelClass: ["error-snackbar"],
          })
          this.loadingService.setLoading(false)
        },
      })
    } else {
      console.warn('No se encontró el token en localStorage');
    }
  }

  filterBoards() {
    if (!this.searchQuery.trim()) {
      this.filteredBoards.set(this.boards)
      return
    }

    const filtered = this.boards.filter(
      (board) =>
        board.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        board.desc.toLowerCase().includes(this.searchQuery.toLowerCase()),
    )
    this.filteredBoards.set(filtered)
  }

  clearSearch() {
    this.searchQuery = ""
    this.filteredBoards.set(this.boards)
  }

  viewBoard(boardId: string) {
    this.router.navigate(["/board", boardId])
    console.log("Navigating to board:", boardId)
  }

  viewAnalytics(boardId: string) {
    this.router.navigate(["/analytics", boardId])
  }

  openCreateBoardDialog() {
    const dialogRef = this.dialog.open(CreateBoardDialogComponent, {
      width: "500px",
      disableClose: false,
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trelloService.createBoard(result.name, result.description).subscribe({
          next: (newBoard) => {
            this.boards.unshift(newBoard)
            this.filterBoards()
            this.snackBar.open("Tablero creado exitosamente", "Cerrar", {
              duration: 3000,
              panelClass: ["success-snackbar"],
            })
          },
          error: (error) => {
            console.error("Error creating board:", error)
            this.snackBar.open("Error al crear el tablero", "Cerrar", {
              duration: 3000,
              panelClass: ["error-snackbar"],
            })
          },
        })
      }
    })
  }

  getActiveBoards(): number {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    return this.boards.filter((board) => new Date(board.dateLastActivity) > threeDaysAgo).length
  }

  getRecentActivity(): number {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return this.boards.filter((board) => new Date(board.dateLastActivity) > oneDayAgo).length
  }

  getRandomViews(): number {
    return Math.floor(Math.random() * 100) + 10
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Ayer"
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`
    return date.toLocaleDateString("es-ES")
  }

}
