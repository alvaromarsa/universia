import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, switchMap, tap } from 'rxjs';
import { CommonModule, AsyncPipe } from '@angular/common';


import { Petitions } from '../../../shared/services/petitions.service';
import { Planeta } from '../../../shared/interfaces/planet.interface';


@Component({
  selector: 'planet-detail.component',
  standalone: true,
  imports: [ CommonModule, AsyncPipe ],
  templateUrl: './planet-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetDetailComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  public petitionsInject = inject(Petitions);
  public planetData$!: Observable<Planeta[]>;

ngOnInit(): void {

  this.planetData$ = this.route.paramMap.pipe(
    switchMap(params => {
      const nombre = params.get('nombrePlaneta');
      return nombre ? this.petitionsInject.getPlanetsData(nombre) : of([]);
    }),
    tap(datos => {
      console.log('📦 Datos recibidos de la API:', datos); // Esto para ver el array de planetas
    })
  );
}
}
