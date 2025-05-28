import { Injectable, signal } from "@angular/core"
import { BehaviorSubject } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false)
  public loading$ = this.loadingSubject.asObservable()

  // Signal for reactive state
  loading = signal(false)

  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading)
    this.loading.set(loading)
  }

  isLoading(): boolean {
    return this.loadingSubject.value
  }
}