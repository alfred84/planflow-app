import { Injectable, effect, inject, signal } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, of, delay, throwError } from "rxjs"
import { catchError, tap } from "rxjs/operators"

export interface TrelloBoard {
  id: string
  name: string
  desc: string
  url: string
  dateLastActivity: string
  prefs: {
    backgroundColor: string
    backgroundImage?: string
  }
}

export interface TrelloList {
  id: string
  name: string
  pos: number
  closed: boolean
}

export interface TrelloCard {
  id: string
  name: string
  desc: string
  pos: number
  due: string | null
  dateLastActivity: string
  idList: string
  labels: TrelloLabel[]
  members: TrelloMember[]
  closed: boolean
}

export interface TrelloLabel {
  id: string
  name: string
  color: string
}

export interface TrelloMember {
  id: string
  fullName: string
  username: string
  avatarHash: string
}

@Injectable({
  providedIn: "root",
})
export class TrelloService {

  public apiKeySignal = signal<string | null>(null);
  public tokenSignal = signal<string | null>(null);

  private http = inject(HttpClient)
  private readonly BASE_URL = "https://api.trello.com/1"

  constructor() {
    // Cargar token desde localStorage si existe
    const savedToken = localStorage.getItem('trello_token');
    if (savedToken) {
      this.tokenSignal.set(savedToken);
    }

    // Opcional: efecto para sincronizar el signal con localStorage
    effect(() => {
      const token = this.tokenSignal();
      if (token) {
        localStorage.setItem('trello_token', token);
      } else {
        localStorage.removeItem('trello_token');
      }
    });
  }

  // Datos mock mejorados para demostración
  private boards: TrelloBoard[] = [
    // {
    //   id: "board_1",
    //   name: "Desarrollo Frontend",
    //   desc: "Proyecto principal de desarrollo con Angular 19",
    //   url: "https://trello.com/b/board_1",
    //   dateLastActivity: new Date().toISOString(),
    //   prefs: { backgroundColor: "#0079bf" },
    // },
    // {
    //   id: "board_2",
    //   name: "Campaña Marketing Q1",
    //   desc: "Iniciativas de marketing para el primer trimestre",
    //   url: "https://trello.com/b/board_2",
    //   dateLastActivity: new Date(Date.now() - 86400000).toISOString(),
    //   prefs: { backgroundColor: "#d29034" },
    // },
    // {
    //   id: "board_3",
    //   name: "Seguimiento de Bugs",
    //   desc: "Rastreo y resolución de errores del sistema",
    //   url: "https://trello.com/b/board_3",
    //   dateLastActivity: new Date(Date.now() - 172800000).toISOString(),
    //   prefs: { backgroundColor: "#519839" },
    // },
    // {
    //   id: "board_4",
    //   name: "Planificación UX/UI",
    //   desc: "Diseño de experiencia de usuario y interfaces",
    //   url: "https://trello.com/b/board_4",
    //   dateLastActivity: new Date(Date.now() - 259200000).toISOString(),
    //   prefs: { backgroundColor: "#c377e0" },
    // },
  ]

  private mockLists: { [boardId: string]: TrelloList[] } = {
    // board_1: [
    //   { id: "list_1", name: "Por Hacer", pos: 1, closed: false },
    //   { id: "list_2", name: "En Progreso", pos: 2, closed: false },
    //   { id: "list_3", name: "Revisión", pos: 3, closed: false },
    //   { id: "list_4", name: "Completado", pos: 4, closed: false },
    // ],
    // board_2: [
    //   { id: "list_5", name: "Ideas", pos: 1, closed: false },
    //   { id: "list_6", name: "Planificación", pos: 2, closed: false },
    //   { id: "list_7", name: "Ejecución", pos: 3, closed: false },
    //   { id: "list_8", name: "Finalizado", pos: 4, closed: false },
    // ],
    // board_3: [
    //   { id: "list_9", name: "Nuevos Bugs", pos: 1, closed: false },
    //   { id: "list_10", name: "En Investigación", pos: 2, closed: false },
    //   { id: "list_11", name: "En Corrección", pos: 3, closed: false },
    //   { id: "list_12", name: "Resuelto", pos: 4, closed: false },
    // ],
    // board_4: [
    //   { id: "list_13", name: "Backlog", pos: 1, closed: false },
    //   { id: "list_14", name: "Diseñando", pos: 2, closed: false },
    //   { id: "list_15", name: "Prototipado", pos: 3, closed: false },
    //   { id: "list_16", name: "Aprobado", pos: 4, closed: false },
    // ],
  }

  private mockCards: { [listId: string]: TrelloCard[] } = {
    // list_1: [
    //   {
    //     id: "card_1",
    //     name: "Implementar autenticación OAuth",
    //     desc: "Integrar sistema de autenticación con Trello usando OAuth 2.0",
    //     pos: 1,
    //     due: new Date(Date.now() + 604800000).toISOString(),
    //     dateLastActivity: new Date().toISOString(),
    //     idList: "list_1",
    //     labels: [{ id: "label_1", name: "Feature", color: "green" }],
    //     members: [],
    //     closed: false,
    //   },
    //   {
    //     id: "card_2",
    //     name: "Diseñar dashboard responsivo",
    //     desc: "Crear diseño adaptativo para el dashboard principal",
    //     pos: 2,
    //     due: null,
    //     dateLastActivity: new Date(Date.now() - 3600000).toISOString(),
    //     idList: "list_1",
    //     labels: [{ id: "label_2", name: "UI/UX", color: "blue" }],
    //     members: [],
    //     closed: false,
    //   },
    //   {
    //     id: "card_3",
    //     name: "Optimizar rendimiento",
    //     desc: "Mejorar Core Web Vitals y tiempo de carga",
    //     pos: 3,
    //     due: new Date(Date.now() + 1209600000).toISOString(),
    //     dateLastActivity: new Date(Date.now() - 7200000).toISOString(),
    //     idList: "list_1",
    //     labels: [{ id: "label_3", name: "Performance", color: "orange" }],
    //     members: [],
    //     closed: false,
    //   },
    // ],
    // list_2: [
    //   {
    //     id: "card_4",
    //     name: "Configurar proyecto Angular 19",
    //     desc: "Inicializar proyecto con Angular 19 y configurar dependencias",
    //     pos: 1,
    //     due: null,
    //     dateLastActivity: new Date(Date.now() - 7200000).toISOString(),
    //     idList: "list_2",
    //     labels: [{ id: "label_4", name: "Setup", color: "purple" }],
    //     members: [],
    //     closed: false,
    //   },
    //   {
    //     id: "card_5",
    //     name: "Implementar drag & drop",
    //     desc: "Añadir funcionalidad de arrastrar y soltar con Angular CDK",
    //     pos: 2,
    //     due: new Date(Date.now() + 432000000).toISOString(),
    //     dateLastActivity: new Date(Date.now() - 1800000).toISOString(),
    //     idList: "list_2",
    //     labels: [{ id: "label_5", name: "Feature", color: "green" }],
    //     members: [],
    //     closed: false,
    //   },
    // ],
    // list_3: [
    //   {
    //     id: "card_6",
    //     name: "Revisar componentes UI",
    //     desc: "Validar que todos los componentes sigan las guías de diseño",
    //     pos: 1,
    //     due: null,
    //     dateLastActivity: new Date(Date.now() - 14400000).toISOString(),
    //     idList: "list_3",
    //     labels: [{ id: "label_6", name: "Review", color: "yellow" }],
    //     members: [],
    //     closed: false,
    //   },
    // ],
    // list_4: [
    //   {
    //     id: "card_7",
    //     name: "Planificación inicial",
    //     desc: "Definir alcance y requerimientos del proyecto",
    //     pos: 1,
    //     due: null,
    //     dateLastActivity: new Date(Date.now() - 86400000).toISOString(),
    //     idList: "list_4",
    //     labels: [{ id: "label_7", name: "Planning", color: "purple" }],
    //     members: [],
    //     closed: false,
    //   },
    //   {
    //     id: "card_8",
    //     name: "Configurar CI/CD",
    //     desc: "Establecer pipeline de integración y despliegue continuo",
    //     pos: 2,
    //     due: null,
    //     dateLastActivity: new Date(Date.now() - 172800000).toISOString(),
    //     idList: "list_4",
    //     labels: [{ id: "label_8", name: "DevOps", color: "red" }],
    //     members: [],
    //     closed: false,
    //   },
    // ],
  }

  // TODO: ok
  getBoards( apiKey: string, token:string ): Observable<TrelloBoard[]> {
    this.apiKeySignal.set(apiKey);
    return this.http.get<any[]>(`${this.BASE_URL}/members/me/boards?key=${apiKey}&token=${token}`).pipe(
      tap( resp => console.log('respuesta de getBoards', resp) )
    )
  }
  // TODO: ok
  getBoard(id: string): Observable<any | undefined> {
    console.log('id', id)
    return this.http.get<any>(this.BASE_URL + `/boards/${id}?key=${this.apiKeySignal()}&token=${this.tokenSignal()}`).pipe(
      tap(resp => console.log('respuesta de getBoard', resp)),
      catchError((error) => {
        console.error("Error loading board:", error)
        return throwError(() => new Error("Error al cargar el tablero"))
      }),
    )
  }

  // TODO: ok
  getLists(boardId: string): Observable<TrelloList[]> {
    console.log('boardId', boardId)
    return this.http.get<TrelloList[]>(`${this.BASE_URL}/boards/${boardId}/lists?key=${this.apiKeySignal()}&token=${this.tokenSignal()}`).pipe(
      tap(resp => console.log('respuesta de getLists', resp)),
      catchError((error) => {
        console.error("Error loading lists:", error)
        return throwError(() => new Error("Error al cargar las listas"))
      }
    )
    )
  }

  //TODO:ok
  getCards(listId: string): Observable<TrelloCard[]> {
    return this.http.get<TrelloCard[]>(`${this.BASE_URL}/lists/${listId}/cards?key=${this.apiKeySignal()}&token=${this.tokenSignal()}`).pipe(
      tap(resp => console.log('respuesta de getCards', resp)),
      catchError((error) => {
        console.error("Error loading cards:", error)
        return throwError(() => new Error("Error al cargar las tarjetas"))
      }),
    )
  }

  //TODO:ok
  getAllCardsForBoard(boardId: string): Observable<TrelloCard[]> {
    return this.http.get<TrelloCard[]>(`${this.BASE_URL}/boards/${boardId}/cards?key=${this.apiKeySignal()}&token=${this.tokenSignal()}`).pipe(
      tap(resp => console.log('respuesta de getAllCardsForBoard', resp)),
      catchError((error) => {
        console.error("Error loading all cards:", error)
        return throwError(() => new Error("Error al cargar todas las tarjetas"))
      }),
    )
  }

  createBoard(name: string, desc: string): Observable<TrelloBoard> {
    // https://api.trello.com/1/boards/?name={name}&key=APIKey&token=APIToken
    // const newBoard: TrelloBoard = {
    //   id: "board_" + Date.now(),
    //   name,
    //   desc,
    //   url: `https://trello.com/b/board_${Date.now()}`,
    //   dateLastActivity: new Date().toISOString(),
    //   prefs: { backgroundColor: "#0079bf" },
    // }

    // this.boards.unshift(newBoard)
    // this.mockLists[newBoard.id] = [
    //   { id: `list_${Date.now()}_1`, name: "Por Hacer", pos: 1, closed: false },
    //   { id: `list_${Date.now()}_2`, name: "En Progreso", pos: 2, closed: false },
    //   { id: `list_${Date.now()}_3`, name: "Completado", pos: 3, closed: false },
    // ]

    // return of(newBoard).pipe(
    //   delay(500),
    //   catchError((error) => {
    //     console.error("Error creating board:", error)
    //     return throwError(() => new Error("Error al crear el tablero"))
    //   }),
    // )
    return this.http.post<TrelloBoard>(`${this.BASE_URL}/boards/?name=${name}&key=${this.apiKeySignal()}&token=${this.tokenSignal()}`, { desc }).pipe(
      tap(resp => console.log('respuesta de createBoard', resp)),
      catchError((error) => {
        console.error("Error creating board:", error)
        return throwError(() => new Error("Error al crear el tablero"))
      }),
    )
  }

  createCard(listId: string, name: string, desc: string): Observable<TrelloCard> {
    // 'https://api.trello.com/1/cards?idList=5abbe4b7ddc1b351ef961414&key=APIKey&token=APIToken'
    // const newCard: TrelloCard = {
    //   id: "card_" + Date.now(),
    //   name,
    //   desc,
    //   pos: (this.mockCards[listId]?.length || 0) + 1,
    //   due: null,
    //   dateLastActivity: new Date().toISOString(),
    //   idList: listId,
    //   labels: [],
    //   members: [],
    //   closed: false,
    // }

    // if (!this.mockCards[listId]) {
    //   this.mockCards[listId] = []
    // }
    // this.mockCards[listId].push(newCard)

    // return of(newCard).pipe(
    //   delay(300),
    //   catchError((error) => {
    //     console.error("Error creating card:", error)
    //     return throwError(() => new Error("Error al crear la tarjeta"))
    //   }),
    // )
    return this.http.post<TrelloCard>(`${this.BASE_URL}/cards?idList=${listId}&key=${this.apiKeySignal()}&token=${this.tokenSignal()}`, { name, desc }).pipe(
      tap(resp => console.log('respuesta de createCard', resp)),
      catchError((error) => {
        console.error("Error creating card:", error)
        return throwError(() => new Error("Error al crear la tarjeta"))
      }
    ))
  }
  //TODO: ok
  updateCard(cardId: string, updates: Partial<TrelloCard>): Observable<TrelloCard> {
    return this.http.put<TrelloCard>(`${this.BASE_URL}/cards/${cardId}?key=${this.apiKeySignal()}&token=${this.tokenSignal()}`, updates)
  }

  //! IMPLEMENTARRRRRRRRRRRRRRRRRRRR
  moveCard(cardId: string, newListId: string, newPosition: number): Observable<TrelloCard> {
    let card: TrelloCard | undefined
    let oldListId: string | undefined

    // https://api.trello.com/1/cards/{cardID}?idBoard={boardId}&idList={listID}

    // Encontrar y remover la tarjeta de su lista actual
    // for (const listId in this.mockCards) {
    //   const cardIndex = this.mockCards[listId].findIndex((c) => c.id === cardId)
    //   if (cardIndex !== -1) {
    //     card = this.mockCards[listId].splice(cardIndex, 1)[0]
    //     oldListId = listId
    //     break
    //   }
    // }

    // if (!card) {
    //   return throwError(() => new Error("Tarjeta no encontrada"))
    // }

    // // Actualizar la tarjeta y añadirla a la nueva lista
    // card.idList = newListId
    // card.pos = newPosition
    // card.dateLastActivity = new Date().toISOString()

    // if (!this.mockCards[newListId]) {
    //   this.mockCards[newListId] = []
    // }
    // this.mockCards[newListId].splice(newPosition, 0, card)

    // return of(card).pipe(
    //   delay(300),
    //   catchError((error) => {
    //     console.error("Error moving card:", error)
    //     return throwError(() => new Error("Error al mover la tarjeta"))
    //   }),
    // )

    return this.http.put<TrelloCard>(`${this.BASE_URL}/cards/${cardId}?key=${this.apiKeySignal()}&token=${this.tokenSignal()}`, {
      idList: newListId,
      pos: newPosition,
    }).pipe(
      tap(resp => console.log('respuesta de moveCard', resp)),
      catchError((error) => {
        console.error("Error moving card:", error)
        return throwError(() => new Error("Error al mover la tarjeta"))
      }),
    )
  }

  //TODO:ok
  searchCards(boardId: string, query: string): Observable<TrelloCard[]> {
    // const lists = this.mockLists[boardId] || []
    // const allCards: TrelloCard[] = []

    // lists.forEach((list) => {
    //   const cards = this.mockCards[list.id] || []
    //   allCards.push(...cards)
    // })

    // const filteredCards = allCards.filter(
    //   (card) =>
    //     card.name.toLowerCase().includes(query.toLowerCase()) || card.desc.toLowerCase().includes(query.toLowerCase()),
    // )

    // return of(filteredCards).pipe(
    //   delay(200),
    //   catchError((error) => {
    //     console.error("Error searching cards:", error)
    //     return throwError(() => new Error("Error al buscar tarjetas"))
    //   }),
    // )
    return this.http.get<TrelloCard[]>(`${this.BASE_URL}/boards/${boardId}/cards/search?query=${query}&key=${this.apiKeySignal()}&token=${this.tokenSignal()}`).pipe(
      tap(resp => console.log('respuesta de searchCards', resp)),
      catchError((error) => {
        console.error("Error searching cards:", error)
        return throwError(() => new Error("Error al buscar tarjetas"))
      }),
    )
  }
}
