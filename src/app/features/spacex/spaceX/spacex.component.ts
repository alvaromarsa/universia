import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';

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
export class SpacexComponent {
  readonly launchState$: Observable<LaunchViewState>;

  constructor(private readonly spacexService: SpacexService) {
    this.launchState$ = this.spacexService.getRecentLaunches().pipe(
      map((launches) => ({ launches: launches.slice(0, 9), error: null })),
      catchError((error) => {
        console.error('Error al cargar los lanzamientos de SpaceX', error);
        return of({
          launches: [],
          error: 'No se pudieron cargar los lanzamientos de SpaceX.',
        });
      })
    );
  }
}
