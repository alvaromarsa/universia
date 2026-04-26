import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly pendingRequestsSubject = new BehaviorSubject(0);

  get isLoading$(): Observable<boolean> {
    return this.pendingRequestsSubject.asObservable().pipe(
      map((pendingRequests) => pendingRequests > 0)
    );
  }

  start(): void {
    this.pendingRequestsSubject.next(this.pendingRequestsSubject.value + 1);
  }

  stop(): void {
    this.pendingRequestsSubject.next(Math.max(0, this.pendingRequestsSubject.value - 1));
  }
}
