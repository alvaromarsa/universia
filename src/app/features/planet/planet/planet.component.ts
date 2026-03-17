import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';



import { PlanetService } from '../planet.service';
import { Planeta } from '@shared/interfaces/planet.interface';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'planetComponent',
  standalone: true,
  imports: [CommonModule, AsyncPipe, TranslatePipe],
  templateUrl: './planet.component.html',
  styleUrls: ['./planet.component.css'],
})
export class PlanetComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  public petitionsInject = inject(PlanetService);
  private router = inject(Router);
  public planetsName$!: Observable<Planeta[]>;
  public randomNumber: number = this.getRandomNumber();
  public planetData$!: Observable<Planeta[]>;

  public idSeleccionado: string | null = null;
  // control para que el sistema no se oculte inmediatamente al seleccionar
  public hideSystem: boolean = false;

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
      }),
      tap(planetas => {
        console.log('Planetas cargados:', planetas);
        console.log('randomNumber:', this.randomNumber);
      })
    );

 }

 getPlanetsData():void {
      this.planetData$ = this.route.paramMap.pipe(
        switchMap(params => {
          const nombre = params.get('nombrePlaneta');
          return nombre ? this.petitionsInject.getPlanetsData(nombre) : of([]);
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

public posicionInicial = { x: 0, y: 0 };

viajarAPlaneta(event: MouseEvent, id: string) {
  // prevenir clicks múltiples durante el zoom
  if (this.idSeleccionado) {
    return;
  }

  // si conseguimos el elemento del planeta, calculamos su centro y la
  // traslación necesaria para llevarlo al centro tras escalar
  const anchor = event.currentTarget as HTMLElement;
  const videoElem = anchor.querySelector('.video-planeta') as HTMLElement | null;
  let tX = 0;
  let tY = 0;
  // predeclaro containerScale para usarlo más tarde incluso si falta videoElem
  let containerScale = 1;
  if (videoElem) {
    const rect = videoElem.getBoundingClientRect();
    // coordenadas del centro del planeta en pantalla
    const absCenterX = rect.left + rect.width / 2;
    const absCenterY = rect.top + rect.height / 2;

    // tamaño final base en la ventana (como antes)
    const targetWidth = Math.min(window.innerWidth * 0.5, 300);
    let scale = targetWidth / rect.width;
    // reducimos el zoom final a aproximadamente la mitad
    containerScale = Math.min(scale * 2, 10);
    document.documentElement.style.setProperty('--scale-final', containerScale.toString());

    // ahora calculamos la traslación que necesitamos aplicar al contenedor.
    const containerRect = (
      document.querySelector('.sistema-solar-container') as HTMLElement
    )?.getBoundingClientRect();

    if (containerRect) {
      // localizar el punto dentro del contenedor
      const localX = absCenterX - containerRect.left;
      const localY = absCenterY - containerRect.top;

      // después de escalar desde la esquina, la ubicación global del punto será
      // containerRect.left + localX * containerScale
      tX = window.innerWidth / 2 - (containerRect.left + localX * containerScale);
      tY = window.innerHeight / 2 - (containerRect.top + localY * containerScale);
    }
  }

  document.documentElement.style.setProperty('--tx', `${tX}px`);
  document.documentElement.style.setProperty('--ty', `${tY}px`);

    // guardamos también dónde queda el planeta al terminar (centro de viewport)
    // calculamos el tamaño final del video del planeta
    if (videoElem) {
      const rect = videoElem.getBoundingClientRect();
      // finalSize es el tamaño real del video después del zoom
      const finalSize = rect.width * containerScale;
      document.documentElement.style.setProperty('--final-planet-size', `${finalSize}px`);
    }

    document.documentElement.style.setProperty('--final-x', `${window.innerWidth / 2}px`);
    document.documentElement.style.setProperty('--final-y', `${window.innerHeight / 2}px`);
    document.documentElement.style.setProperty('--final-scale', containerScale.toString());

  // Desactivamos el navbar durante el zoom
  document.body.classList.add('zoom-active');

  //this.posicionInicial = { x, y };
  // mostramos la animación sin ocultar todavía el sistema
  this.idSeleccionado = id;
  this.hideSystem = false;

  setTimeout(() => {
    // primero navegamos
    this.router.navigate(['/planets', id]);
    // Reactivamos el navbar después de la navegación
    document.body.classList.remove('zoom-active');
  }, 1500);

  // ocultamos el sistema con un fade largo DESPUÉS de navegar
  setTimeout(() => {
    this.hideSystem = true;
  }, 1600);
}

}
