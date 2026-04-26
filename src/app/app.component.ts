import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, ChildrenOutletContexts } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { slideInAnimation } from './shared/animations/animations';
import { LoadingService } from './core/services/loading.service';
import { NotificationService } from './core/services/notification.service';
import type { AppNotification } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  animations: [slideInAnimation],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'universia';
  readonly isLoading$ = this.loadingService.isLoading$;
  readonly notifications$ = this.notificationService.notifications$;

  constructor(
    private readonly contexts: ChildrenOutletContexts,
    private readonly loadingService: LoadingService,
    private readonly notificationService: NotificationService
  ) {}

  // Este método le dice a la animación que algo ha cambiado
  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  dismissNotification(id: number): void {
    this.notificationService.dismiss(id);
  }

  trackNotificationById(_: number, notification: AppNotification): number {
    return notification.id;
  }
}
