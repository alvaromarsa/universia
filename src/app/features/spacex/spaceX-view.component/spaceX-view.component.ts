import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, startWith, switchMap, take } from 'rxjs';

import { AuthService } from 'src/app/core/services/auth.service';
import { FavoriteItem, FavoritesService } from 'src/app/core/services/favorites.service';
import { SpacexInterface } from '../spacexInterface';
import { SpacexService } from '../spacexService';
import { SpacexLaunchDetailComponent } from './spacex-launch-detail.component';

interface LaunchDetailState {
  launch: SpacexInterface | null;
  error: string | null;
  loading: boolean;
}

interface LaunchDetailViewModel extends LaunchDetailState {
  isFavorite: boolean;
}

@Component({
  selector: 'app-space-x-view.component',
  standalone: true,
  imports: [NgIf, AsyncPipe, RouterModule, SpacexLaunchDetailComponent],
  templateUrl: './spaceX-view.component.html',
  styleUrls: ['../spacex.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceXViewComponent {
  readonly viewModel$: Observable<LaunchDetailViewModel>;
  private readonly favoriteRefresh$ = new BehaviorSubject(0);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly spacexService: SpacexService,
    private readonly favoritesService: FavoritesService,
    private readonly authService: AuthService
  ) {
    const launchState$ = this.route.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) => {
        if (!id) {
          return of({
            launch: null,
            error: 'No se encontró el lanzamiento solicitado.',
            loading: false,
          });
        }

        return this.spacexService.getLaunchById(id).pipe(
          map((launch) => ({ launch, error: null, loading: false })),
          catchError((error) => {
            console.error('Error al cargar el detalle de SpaceX', error);
            return of({
              launch: null,
              error: 'No se pudo cargar el detalle del lanzamiento.',
              loading: false,
            });
          }),
          startWith({ launch: null, error: null, loading: true })
        );
      })
    );

    this.viewModel$ = combineLatest([
      launchState$,
      this.authService.user$,
      this.favoriteRefresh$,
    ]).pipe(
      map(([state, user]) => ({
        ...state,
        isFavorite:
          !!user?.uid &&
          !!state.launch &&
          this.favoritesService.isFavorite(user.uid, state.launch.id, 'spacex'),
      }))
    );
  }

  goBack(): void {
    this.router.navigate(['/spacex']);
  }

  toggleFavorite(launch: SpacexInterface, isFavorite: boolean): void {
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      if (!user?.uid) {
        this.router.navigate(['/login']);
        return;
      }

      const favoriteItem: FavoriteItem = {
        id: launch.id,
        type: 'spacex',
        title: launch.name,
        description: launch.details ?? 'Sin descripción.',
        imageUrl: launch.links.patch.small || 'assets/images/fondo.jpg',
      };

      if (isFavorite) {
        this.favoritesService.removeFavorite(user.uid, favoriteItem.id, favoriteItem.type);
      } else {
        this.favoritesService.addFavorite(user.uid, favoriteItem);
      }

      this.favoriteRefresh$.next(this.favoriteRefresh$.value + 1);
    });
  }

  getLaunchStatus(success: boolean | null): string {
    if (success === true) {
      return 'Exitoso';
    }

    if (success === false) {
      return 'Fallido';
    }

    return 'Sin datos';
  }

  getLaunchStatusClass(success: boolean | null): string {
    if (success === true) {
      return 'status-success';
    }

    if (success === false) {
      return 'status-failure';
    }

    return '';
  }
}
