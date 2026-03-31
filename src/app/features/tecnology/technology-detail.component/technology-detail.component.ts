import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { TechnologyService } from '../technologyService';
import { TechnologyInterface } from '../technology/technologyInterface';
import { TechnologyTranslatePipe } from '@shared/pipes/technology-translate.pipe';
import { TechnologyDescriptionTranslatePipe } from './technology-description-translate.pipe';

@Component({
  selector: 'technology-detail.component',
  standalone: true,
  imports: [CommonModule, TechnologyTranslatePipe, TechnologyDescriptionTranslatePipe],
  templateUrl: './technology-detail.component.html',
  styleUrl: './technology-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnologyDetailComponent implements OnInit {
  public readonly fallbackImage = 'assets/images/fondo.jpg';
  public allTechnologies: TechnologyInterface[] = [];
  public currentTechnology: TechnologyInterface | null = null;
  public currentIndex = -1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private technologyService: TechnologyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          return of({ id: '', list: [] as TechnologyInterface[] });
        }

        return this.technologyService.getFavTecnologies().pipe(
          map(list => ({ id, list })),
          catchError(() => of({ id, list: [] as TechnologyInterface[] }))
        );
      }),
      tap(({ id, list }) => {
        this.allTechnologies = list;
        this.currentIndex = list.findIndex(tech => tech.id === id);
        this.currentTechnology = this.currentIndex >= 0 ? list[this.currentIndex] : null;
        this.cdr.markForCheck();
      })
    ).subscribe();
  }

  goBack(): void {
    this.router.navigate(['/technology']);
  }

  goPrev(): void {
    if (this.currentIndex > 0) {
      const prev = this.allTechnologies[this.currentIndex - 1];
      this.router.navigate(['/technology', prev.id]);
    }
  }

  goNext(): void {
    if (this.currentIndex >= 0 && this.currentIndex < this.allTechnologies.length - 1) {
      const next = this.allTechnologies[this.currentIndex + 1];
      this.router.navigate(['/technology', next.id]);
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
}
