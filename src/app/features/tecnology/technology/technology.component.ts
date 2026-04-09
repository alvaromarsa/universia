import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser} from '@angular/common';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';


import { TechnologyService } from '../technologyService';
import { TechnologyInterface } from './technologyInterface';
import { TechnologyTranslatePipe } from '@shared/pipes/technology-translate.pipe';


@Component({
  selector: 'technology-component',
  standalone: true,
  imports: [CommonModule, TechnologyTranslatePipe],
  templateUrl: './technology.component.html',
  styleUrls: ['./technology.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnologyComponent implements OnInit {
  public readonly fallbackImage = 'assets/images/fondo.jpg';

  public allTechnologies: TechnologyInterface[] = []; // Las 28 tecnologias
  public visibleTechnologies$: Observable<TechnologyInterface[]> | undefined; // Las 4 tecnologias visibles

  public currentPage$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public pageSize: number = 4;

  constructor( private technologyService: TechnologyService,
               private route: ActivatedRoute,
               private router: Router,
               @Inject(PLATFORM_ID) private platformId: Object
              ) { }

ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Read initial page from query params
      this.route.queryParams.subscribe(params => {
        const page = +params['page'] || 0;
        this.currentPage$.next(page);
      });

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

  getTechnologyImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl || !imageUrl.toString().trim()) {
      return this.fallbackImage;
    }

    return imageUrl;
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;

    if (!image || image.src.includes(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
  }

  get totalPages(): number {
    if (this.allTechnologies.length === 0) {
      return 0;
    }
    return Math.ceil(this.allTechnologies.length / this.pageSize);
  }

  goToTechnologyDetail(id: string): void {
    this.router.navigate(['/technology', id], { queryParams: { page: this.currentPage$.value } });
  }

 }
