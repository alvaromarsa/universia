import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, combineLatest, distinctUntilChanged, fromEvent, map, Observable, of, startWith } from 'rxjs';

import { SpacexInterface } from '../spacexInterface';
import { SpacexService } from '../spacexService';
import { SpacexLaunchListComponent } from './spacex-launch-list.component';

interface LaunchViewState {
  launches: SpacexInterface[];
  error: string | null;
  loading: boolean;
}

@Component({
  selector: 'spacexComponent',
  standalone: true,
  imports: [NgIf, AsyncPipe, SpacexLaunchListComponent],
  templateUrl: './spacex.component.html',
  styleUrls: ['../spacex.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpacexComponent {
  readonly launchState$: Observable<LaunchViewState>;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly desktopPageSize = 9;
  private readonly tabletBreakpoint = 1024;

  constructor(
    private readonly spacexService: SpacexService,
    private readonly router: Router
  ) {
    const visibleLaunchLimit$ = this.isBrowser
      ? fromEvent(window, 'resize').pipe(
          map(() => window.innerWidth),
          startWith(window.innerWidth),
          map((viewportWidth) => this.getVisibleLaunchLimit(viewportWidth)),
          distinctUntilChanged()
        )
      : of(this.desktopPageSize);

    const launchesState$ = this.spacexService.getRecentLaunches().pipe(
      map((launches) => ({
        launches,
        error: null,
        loading: false,
      })),
      catchError((error) => {
        console.error('Error al cargar los lanzamientos de SpaceX', error);
        return of({
          launches: [],
          error: 'No se pudieron cargar los lanzamientos de SpaceX.',
          loading: false,
        });
      }),
      startWith({
        launches: [],
        error: null,
        loading: true,
      })
    );

    this.launchState$ = combineLatest([
      launchesState$,
      visibleLaunchLimit$,
    ]).pipe(
      map(([state, visibleLaunchLimit]) => ({
        ...state,
        launches:
          state.loading || visibleLaunchLimit === null
            ? state.launches
            : state.launches.slice(0, visibleLaunchLimit),
      }))
    );
  }

  openLaunchDetail(launch: SpacexInterface): void {
    this.router.navigate(['/spacex', launch.id]);
  }

  private getVisibleLaunchLimit(viewportWidth: number): number | null {
    if (viewportWidth <= this.tabletBreakpoint) {
      return null;
    }

    return this.desktopPageSize;
  }
}
