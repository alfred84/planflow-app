import { Injectable, effect, inject, signal } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, throwError } from "rxjs"
import { catchError, tap } from "rxjs/operators"
import { TrelloBoard, TrelloCard, TrelloList } from "../models/trello.model";

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
    return this.http.post<TrelloBoard>(`${this.BASE_URL}/boards/?name=${name}&key=${this.apiKeySignal()}&token=${this.tokenSignal()}`, { desc }).pipe(
      tap(resp => console.log('respuesta de createBoard', resp)),
      catchError((error) => {
        console.error("Error creating board:", error)
        return throwError(() => new Error("Error al crear el tablero"))
      }),
    )
  }

  createCard(listId: string, name: string, desc: string): Observable<TrelloCard> {    
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
    return this.http.get<TrelloCard[]>(`${this.BASE_URL}/boards/${boardId}/cards/search?query=${query}&key=${this.apiKeySignal()}&token=${this.tokenSignal()}`).pipe(
      tap(resp => console.log('respuesta de searchCards', resp)),
      catchError((error) => {
        console.error("Error searching cards:", error)
        return throwError(() => new Error("Error al buscar tarjetas"))
      }),
    )
  }
}
