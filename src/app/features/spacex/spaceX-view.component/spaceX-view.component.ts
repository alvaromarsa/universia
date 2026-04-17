import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';

import { AuthService } from 'src/app/core/services/auth.service';
import { FavoriteItem, FavoritesService } from 'src/app/core/services/favorites.service';
import { SpacexDescriptionTranslatePipe } from '../spacex-description-translate.pipe';
import { SpacexInterface } from '../spacexInterface';
import { SpacexService } from '../spacexService';

interface LaunchDetailState {
  launch: SpacexInterface | null;
  error: string | null;
}

@Component({
  selector: 'app-space-x-view.component',
  standalone: true,
  imports: [NgIf, AsyncPipe, DatePipe, RouterModule, SpacexDescriptionTranslatePipe],
  templateUrl: './spaceX-view.component.html',
  styleUrls: ['../spacex.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceXViewComponent {
  readonly launchState$: Observable<LaunchDetailState>;
  public currentLaunch: SpacexInterface | null = null;
  public currentUserUid: string | null = null;
  public isFavorite = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly spacexService: SpacexService,
    private readonly favoritesService: FavoritesService,
    private readonly authService: AuthService
  ) {
    this.launchState$ = this.route.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) => {
        if (!id) {
          return of({ launch: null, error: 'No se encontró el lanzamiento solicitado.' });
        }

        return this.spacexService.getLaunchById(id).pipe(
          map((launch) => ({ launch, error: null })),
          catchError((error) => {
            console.error('Error al cargar el detalle de SpaceX', error);
            return of({
              launch: null,
              error: 'No se pudo cargar el detalle del lanzamiento.',
            });
          })
        );
      }),
      tap((state) => {
        this.currentLaunch = state.launch;
        this.updateFavoriteState();
      })
    );

    this.authService.user$.subscribe((user) => {
      this.currentUserUid = user?.uid ?? null;
      this.updateFavoriteState();
    });
  }

  goBack(): void {
    this.router.navigate(['/spacex']);
  }

  toggleFavorite(): void {
    if (!this.currentLaunch) {
      return;
    }

    if (!this.currentUserUid) {
      this.router.navigate(['/login']);
      return;
    }

    const favoriteItem: FavoriteItem = {
      id: this.currentLaunch.id,
      type: 'spacex',
      title: this.currentLaunch.name,
      description: this.currentLaunch.details ?? 'Sin descripción.',
      imageUrl: this.currentLaunch.links.patch.small || 'assets/images/fondo.jpg',
    };

    if (this.isFavorite) {
      this.favoritesService.removeFavorite(this.currentUserUid, favoriteItem.id, favoriteItem.type);
    } else {
      this.favoritesService.addFavorite(this.currentUserUid, favoriteItem);
    }

    this.isFavorite = !this.isFavorite;
  }

  private updateFavoriteState(): void {
    if (!this.currentUserUid || !this.currentLaunch) {
      this.isFavorite = false;
      return;
    }

    this.isFavorite = this.favoritesService.isFavorite(
      this.currentUserUid,
      this.currentLaunch.id,
      'spacex'
    );
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
