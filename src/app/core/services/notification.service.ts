import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'error' | 'warning' | 'success' | 'info';

export interface AppNotification {
  id: number;
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  private nextId = 0;

  get notifications$(): Observable<AppNotification[]> {
    return this.notificationsSubject.asObservable();
  }

  show(message: string, type: NotificationType = 'info', durationMs = 5000): number {
    const id = ++this.nextId;
    const notification: AppNotification = { id, message, type };

    this.notificationsSubject.next([...this.notificationsSubject.value, notification]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }

    return id;
  }

  error(message: string, durationMs = 5000): number {
    return this.show(message, 'error', durationMs);
  }

  dismiss(id: number): void {
    this.notificationsSubject.next(
      this.notificationsSubject.value.filter((notification) => notification.id !== id)
    );
  }
}
