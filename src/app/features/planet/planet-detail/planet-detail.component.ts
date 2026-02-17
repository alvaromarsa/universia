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
          console.log('Nombre del planeta:', nombre);
          return nombre ? this.petitionsInject.getPlanetsData(nombre) : of([]);
        })
      );


    }

    getPlanetVideo(name: string): string {
      return name
        .normalize('NFD')                   // Separa tildes
        .replace(/[\u0300-\u036f]/g, '')    // Borra tildes
        .toLowerCase()                      // Minúsculas
        .trim()                             // Quita espacios vacíos al final
        .replace(/\s+/g, '-');              // Cambia espacios por guiones
    }
}
