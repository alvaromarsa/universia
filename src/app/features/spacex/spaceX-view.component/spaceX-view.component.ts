import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

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
  styles: [
    `
      .spacex-view {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        width: 100%;
        position: relative;
        padding: 112px 24px 40px;
      }

      .spacex-view::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: url('/assets/images/fondo.jpg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        mask-image: radial-gradient(circle, black 50%, transparent 100%);
        -webkit-mask-image: radial-gradient(circle, black 50%, transparent 100%);
        opacity: 0.2;
        z-index: 0;
        pointer-events: none;
      }

      .spacex-view-content {
        position: relative;
        z-index: 1;
        width: min(860px, 100%);
      }

      .detail-card {
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: 24px;
        padding: 24px;
        border-radius: 24px;
        background: rgba(8, 15, 35, 0.82);
        border: 1px solid rgba(96, 165, 250, 0.22);
        box-shadow: 0 18px 40px rgba(3, 7, 18, 0.28);
      }

      .detail-media {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        min-height: 220px;
        padding: 20px;
        background: linear-gradient(180deg, #0b3d91 0%, #4281f5 100%);
      }

      .detail-image {
        width: 100%;
        max-width: 180px;
        object-fit: contain;
      }

      .detail-image-fallback {
        display: grid;
        place-items: center;
        width: 140px;
        height: 140px;
        border-radius: 24px;
        color: #fff;
        font-size: 2rem;
        font-weight: 800;
        background: rgba(255, 255, 255, 0.1);
      }

      .detail-body h1 {
        margin: 0 0 18px;
        color: #60a5fa;
        font-size: 1.875rem;
        line-height: 2.25rem;
        font-weight: 800;
      }

      .detail-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 18px;
      }

      .detail-meta div {
        padding: 12px 14px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.05);
      }

      .detail-meta span {
        display: block;
        margin-bottom: 6px;
        color: rgba(255, 255, 255, 0.62);
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .detail-meta strong,
      .detail-meta a {
        color: white;
        word-break: break-word;
      }

      .status-success {
        color: #22c55e !important;
      }

      .status-failure {
        color: #fca5a5 !important;
      }

      .detail-meta a {
        text-decoration: none;
      }

      .detail-meta .wikipedia-link {
        color: #22c55e;
      }

      .detail-meta .webcast-link {
        color: #60a5fa;
      }

      .detail-meta .link-unavailable {
        color: #dc2626;
      }

      .detail-meta a:hover {
        text-decoration: underline;
      }

      .detail-description {
        margin: 0;
        color: rgba(255, 255, 255, 0.88);
        line-height: 1.55;
      }

      .detail-actions {
        display: flex;
        justify-content: center;
        margin-top: 20px;
      }

      .btn-back {
        padding: 12px 24px;
        border-radius: 999px;
        border: 1px solid #4f86e8;
        background: rgba(11, 61, 145, 0.75);
        color: white;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .btn-back:hover {
        background: rgba(11, 61, 145, 1);
      }

      .state-message {
        margin: 0 auto;
        max-width: 560px;
        text-align: center;
        padding: 18px 22px;
        border-radius: 16px;
        background: rgba(8, 15, 35, 0.78);
        color: white;
      }

      @media (max-width: 720px) {
        .spacex-view {
          padding: 104px 16px 32px;
        }

        .detail-card {
          grid-template-columns: 1fr;
        }

        .detail-meta {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceXViewComponent {
  readonly launchState$: Observable<LaunchDetailState>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly spacexService: SpacexService
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
      })
    );
  }

  goBack(): void {
    this.router.navigate(['/spacex']);
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
