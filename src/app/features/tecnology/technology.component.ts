import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser} from '@angular/common';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';


import { TechnologyService } from './technologyService';
import { TechnologyInterface } from './technologyInterface';
import { TechnologyTranslatePipe } from '@shared/pipes/technology-translate.pipe';


@Component({
  selector: 'tecnologyComponent',
  standalone: true,
  imports: [CommonModule, TechnologyTranslatePipe],
  templateUrl: './technology.component.html',
  styleUrls: ['./technology.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnologyComponent implements OnInit {

  public allTechnologies: TechnologyInterface[] = []; // Las 28 tecnologias
  public visibleTechnologies$: Observable<TechnologyInterface[]> | undefined; // Las 4 tecnologias visibles

  public currentPage$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public pageSize: number = 4;

  constructor( private technologyService: TechnologyService,
               @Inject(PLATFORM_ID) private platformId: Object
              ) { }

ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // 3. Definimos cómo se calculan las tecnologías visibles
      const data$ = this.technologyService.getFavTecnologies().pipe(
        tap(data => this.allTechnologies = data), // Guardamos el total para límites
        catchError(error => {
          console.error('❌ Error al obtener las tecnologías:', error);
          return of([]); // Si falla, devolvemos un array vacío para no romper el flujo
        })
      );

      // 4. La magia: Combinamos datos + página actual
      // Cada vez que currentPage$ emita un nuevo número, esto se recalcula solo
      this.visibleTechnologies$ = combineLatest([data$, this.currentPage$]).pipe(
        map(([data, page]) => {
          const start = page * this.pageSize;
          return data.slice(start, start + this.pageSize);
        })
      );
    }
  }

  updatePage(): void {
    const start = this.currentPage$.value * this.pageSize;
    const end = start + this.pageSize;
    this.visibleTechnologies$ = of(this.allTechnologies.slice(start, end));
  }

  nextPage(): void {
    if ((this.currentPage$.value + 1) * this.pageSize < this.allTechnologies.length) {
      this.currentPage$.next(this.currentPage$.value + 1);
      this.updatePage();
    }
  }

  prevPage(): void {
    const prev = this.currentPage$.value - 1;
    if (prev >= 0) {
      this.currentPage$.next(prev);
      this.updatePage();
    }
  }

 }
