import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of } from 'rxjs';

import { SpacexInterface } from '../spacexInterface';
import { SpacexService } from '../spacexService';

interface LaunchViewState {
  launches: SpacexInterface[];
  error: string | null;
}

@Component({
  selector: 'spacexComponent',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, RouterModule],
  templateUrl: './spacex.component.html',
  styleUrls: ['../spacex.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpacexComponent implements OnDestroy {
  readonly launchState$: Observable<LaunchViewState>;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly desktopPageSize = 9;
  private readonly tabletBreakpoint = 1024;
  private readonly mobileBreakpoint = 640;
  private readonly visibleLaunchLimit$ = new BehaviorSubject<number | null>(this.desktopPageSize);
  private readonly resizeHandler = () => this.syncVisibleLaunchLimit();

  constructor(private readonly spacexService: SpacexService) {
    this.syncVisibleLaunchLimit();

    if (this.isBrowser) {
      window.addEventListener('resize', this.resizeHandler);
    }

    this.launchState$ = combineLatest([
      this.spacexService.getRecentLaunches(),
      this.visibleLaunchLimit$,
    ]).pipe(
      map(([launches, visibleLaunchLimit]) => ({
        launches: visibleLaunchLimit === null ? launches : launches.slice(0, visibleLaunchLimit),
        error: null,
      })),
      catchError((error) => {
        console.error('Error al cargar los lanzamientos de SpaceX', error);
        return of({
          launches: [],
          error: 'No se pudieron cargar los lanzamientos de SpaceX.',
        });
      })
    );
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  private syncVisibleLaunchLimit(): void {
    if (!this.isBrowser) {
      this.visibleLaunchLimit$.next(this.desktopPageSize);
      return;
    }

    const viewportWidth = window.innerWidth;

    if (viewportWidth <= this.tabletBreakpoint) {
      this.visibleLaunchLimit$.next(null);
      return;
    }

    this.visibleLaunchLimit$.next(this.desktopPageSize);
  }
}
