import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { CommonModule, AsyncPipe } from '@angular/common';


import { PlanetService } from '../planet.service';
import { Planeta } from 'src/app/features/planet/planet.interface';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { CelsiusPipe } from './celsius.pipe';


@Component({
  selector: 'planet-detail.component',
  standalone: true,
  imports: [ CommonModule, AsyncPipe, TranslatePipe, CelsiusPipe ],
  templateUrl: './planet-detail.component.html',
  styleUrls: ['./planet-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetDetailComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  public petitionsInject = inject(PlanetService);
  public planetData$!: Observable<Planeta[]>;

  tokens: { [key: string]: string } = {
  'jupiter': '0ffe9c51-01e4-41ee-8f07-fb3a1e4cef7e',
  'mars': 'ba070b90-3722-448f-abfe-de18a1ee5660',
  'mercure': '3d322f7f-4481-4d18-942f-96c3565a377e',
  'neptune': '841182cb-5bd4-489d-99c0-91e7d14c3e42',
  'saturne': '9313bdea-22fa-4820-96f6-d7e9a70c0111',
  'terre': '880c9768-3c31-4073-852f-5636452d9b5c',
  'uranus': '8ca0849a-8622-4e94-9b86-a7109b0064ad',
  'venus': '1dbd3f22-1626-49fa-8848-2650e1b736a3',

};

  ngOnInit(): void {

    this.planetData$ = this.route.paramMap.pipe(
      switchMap(params => {
        const nombre = params.get('nombrePlaneta');
        return nombre ? this.petitionsInject.getPlanetsData(nombre) : of([]);
      })
    );
  }

  ensureVideoPlayback(event: Event): void {
    const video = event.target as HTMLVideoElement | null;

    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;

    const playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(() => undefined);
    }
  }

    // 2. Creamos una función que monte la URL solita
  getVideoUrl(planetId: string): string {
  const id = planetId.toLowerCase();
  const token = this.tokens[id];
  const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/universia-ac877.firebasestorage.app/o/';

  return `${baseUrl}${id}.mp4?alt=media&token=${token}`;
  }
}
