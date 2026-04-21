import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
export class TechnologyComponent implements OnInit, OnDestroy {
  public readonly fallbackImage = 'assets/images/fondo.jpg';
  private readonly mobileBreakpoint = 720;
  private readonly desktopPageSize = 4;
  private readonly mobilePageSize = 1;
  private resizeHandler?: () => void;

  public allTechnologies: TechnologyInterface[] = [];
  public visibleTechnologies$: Observable<TechnologyInterface[]> | undefined;

  public currentPage$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public pageSize: number = this.desktopPageSize;

  constructor(
    private technologyService: TechnologyService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.syncPageSize();
      this.resizeHandler = () => this.syncPageSize();
      window.addEventListener('resize', this.resizeHandler);

      this.route.queryParams.subscribe(params => {
        const page = +params['page'] || 0;
        this.currentPage$.next(page);
      });

      const data$ = this.technologyService.getFavTecnologies().pipe(
        tap(data => this.allTechnologies = data),
        catchError(error => {
          console.error('❌ Error al obtener las tecnologías:', error);
          return of([]);
        })
      );

      this.visibleTechnologies$ = combineLatest([data$, this.currentPage$]).pipe(
        map(([data, page]) => {
          const start = page * this.pageSize;
          return data.slice(start, start + this.pageSize);
        })
      );
    }
  }

  ngOnDestroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  private syncPageSize(): void {
    const nextPageSize = window.innerWidth <= this.mobileBreakpoint
      ? this.mobilePageSize
      : this.desktopPageSize;

    if (nextPageSize === this.pageSize) {
      return;
    }

    const currentStart = this.currentPage$.value * this.pageSize;
    this.pageSize = nextPageSize;
    this.currentPage$.next(Math.floor(currentStart / this.pageSize));
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
