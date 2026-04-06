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
  styles: [
    `
      .spacex-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 100vh;
        position: relative;
        padding: 0 24px;
      }

      .spacex-section::before {
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

      .spacex-content {
        flex: 0 0 auto;
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
      }

      .spacex-header {
        position: absolute;
        top: 64px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1;
        width: calc(100% - 32px);
      }

      .spacex-title {
        margin: 0;
        color: #60a5fa;
        font-size: 1.875rem;
        line-height: 2.25rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-align: center;
        text-shadow: 0 6px 18px rgba(11, 61, 145, 0.45);
      }

      .spacex-grid {
        display: grid;
        grid-template-columns: repeat(3, 176px);
        justify-content: center;
        justify-items: center;
        align-content: center;
        gap: 16px;
        width: min(100%, 560px);
      }

      .launch-card {
        background: #4281f5;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        width: 160px;
        height: 160px;
        overflow: hidden;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        cursor: pointer;
        text-decoration: none;
      }

      .launch-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(11, 61, 145, 0.2);
      }

      .launch-card-media {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 126px;
        padding: 11px 11px 5px;
        background: linear-gradient(180deg, #0b3d91 0%, #4281f5 100%);
      }

      .launch-patch {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .launch-patch.is-placeholder {
        width: 67px;
        height: 67px;
      }

      .launch-patch-fallback {
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
        font-weight: 800;
        font-size: 1.45rem;
        color: #ffffff;
      }

      .launch-card-body {
        padding: 5px 8px 13px;
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .launch-name {
        margin: 0;
        color: chartreuse;
        font-size: 0.66rem;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .spacex-error,
      .spacex-empty {
        margin: 0 auto;
        max-width: 520px;
        text-align: center;
        padding: 16px 20px;
        border-radius: 16px;
        background: rgba(8, 15, 35, 0.72);
      }

      .spacex-error {
        border: 1px solid rgba(248, 113, 113, 0.35);
        color: #fecaca;
      }

      .spacex-empty {
        border: 1px solid rgba(96, 165, 250, 0.22);
      }

      @media (max-width: 640px) {
        .spacex-section {
          min-height: auto;
          padding: 0 16px 32px;
        }

        .spacex-header {
          top: 44px;
          width: calc(100% - 32px);
        }

        .spacex-grid {
          grid-template-columns: repeat(2, 1fr);
          width: 100%;
        }

        .launch-card {
          width: min(100%, 160px);
        }
      }
    `,
  ],
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
