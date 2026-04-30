import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { map, Observable } from 'rxjs';
import { Router } from '@angular/router';

import { PlanetService } from '../planet.service';
import { Planeta } from 'src/app/features/planet/planet.interface';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'planetComponent',
  standalone: true,
  imports: [CommonModule, AsyncPipe, TranslatePipe],
  templateUrl: './planet.component.html',
  styleUrls: ['./planet.component.css'],
})
export class PlanetComponent implements OnInit {
  public petitionsInject = inject(PlanetService);
  private router = inject(Router);
  public planetsName$!: Observable<Planeta[]>;
  public randomNumber: number = this.getRandomNumber();

  public idSeleccionado: string | null = null;

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
    this.planetsName$ = this.petitionsInject.getPlanetsName().pipe(
      map(planetas => {
        // Definimos el orden oficial de la NASA
        const ordenReal = ['mercure', 'venus', 'terre', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune'];

        // Copiamos el array original para no mutarlo y luego lo ordenamos comparando con nuestra lista
        return [...planetas].sort((a, b) => {
          const indexA = ordenReal.indexOf(a.id?.toLowerCase() || '');
          const indexB = ordenReal.indexOf(b.id?.toLowerCase() || '');
          return indexA - indexB;
        });
      })
    );

 }

scaleRadius(radiusKm: number): number {
  if (!radiusKm || radiusKm <= 0) return 30;

  // 1. Definimos nuestros límites visuales (en píxeles)
  const minPx = 20; // Lo mínimo que medirá Mercurio
  const maxPx = 55; // Lo máximo que medirá Júpiter

  // 2. Radios de referencia (km)
  const minRadius = 2439;  // Mercurio
  const maxRadius = 69911; // Júpiter

  // 3. ¡La Magia! Usamos Math.sqrt (raíz cuadrada) para que la
  // diferencia no sea tan agresiva. Es la clave de la proporción artística.
  const scale = Math.sqrt(radiusKm - minRadius) / Math.sqrt(maxRadius - minRadius);

  // 4. Interpolamos para que el resultado esté siempre entre minPx y maxPx
  const finalSize = minPx + (scale * (maxPx - minPx));

  return Math.round(finalSize);
}

 getRandomNumber(){
  return Math.floor(Math.random() * 100);
 }

viajarAPlaneta(event: MouseEvent, id: string) {
  // prevenir clicks múltiples durante el zoom
  if (this.idSeleccionado) {
    return;
  }

  // si conseguimos el elemento del planeta, calculamos su centro y la
  // traslación necesaria para llevarlo al centro tras escalar
  const anchor = event.currentTarget as HTMLElement;
  let tX = 0;
  let tY = 0;
  const isSaturnSelected = id.toLowerCase() === 'saturne';
  // Separamos el zoom visible del tamaño que se usa después en detail.
  let detailScale = 1;
  let zoomScale = 1;
  if (anchor) {
    const rect = anchor.getBoundingClientRect();
    // coordenadas del centro del planeta en pantalla
    const absCenterX = rect.left + rect.width / 2;
    const absCenterY = rect.top + rect.height / 2;

    // Saturno necesita un zoom algo mayor para empatar con el tamaño
    // visual que tendrá al entrar en la vista detail.
    const targetWidth = isSaturnSelected
      ? Math.min(window.innerWidth * 0.55, 315)
      : Math.min(window.innerWidth * 0.5, 300);
    let scale = targetWidth / rect.width;
    detailScale = Math.min(scale * 2, 10);
    zoomScale = isSaturnSelected
      ? Math.min(detailScale * 1.08, 10)
      : detailScale;
    document.documentElement.style.setProperty('--scale-final', zoomScale.toString());

    // ahora calculamos la traslación que necesitamos aplicar al contenedor.
    const containerRect = (
      document.querySelector('.sistema-solar-container') as HTMLElement
    )?.getBoundingClientRect();

    if (containerRect) {
      // localizar el punto dentro del contenedor
      const localX = absCenterX - containerRect.left;
      const localY = absCenterY - containerRect.top;

      // después de escalar desde la esquina, la ubicación global del punto será
      // containerRect.left + localX * zoomScale
      tX = window.innerWidth / 2 - (containerRect.left + localX * zoomScale);
      tY = window.innerHeight / 2 - (containerRect.top + localY * zoomScale);
    }
  }

  document.documentElement.style.setProperty('--tx', `${tX}px`);
  document.documentElement.style.setProperty('--ty', `${tY}px`);

    // guardamos también dónde queda el planeta al terminar (centro de viewport)
    // calculamos el tamaño final del video del planeta
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      // finalSize es el tamaño que usará la vista detail al entrar.
      const finalSize = rect.width * detailScale;
      document.documentElement.style.setProperty('--final-planet-size', `${finalSize}px`);
    }

    document.documentElement.style.setProperty('--final-x', `${window.innerWidth / 2}px`);
    document.documentElement.style.setProperty('--final-y', `${window.innerHeight / 2}px`);
    document.documentElement.style.setProperty('--final-scale', detailScale.toString());

  // Desactivamos el navbar durante el zoom
  document.body.classList.add('zoom-active');

  // activamos el zoom y el desvanecido inmediato de los elementos no seleccionados
  this.idSeleccionado = id;

  setTimeout(() => {
    // primero navegamos
    this.router.navigate(['/planets', id]);
    // Reactivamos el navbar después de la navegación
    document.body.classList.remove('zoom-active');
  }, 1500);
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

  getVideoUrl(planetId: string): string {
  const id = planetId.toLowerCase();
  const token = this.tokens[id];
  const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/universia-ac877.firebasestorage.app/o/';

  return `${baseUrl}${id}.mp4?alt=media&token=${token}`;
  }

}
