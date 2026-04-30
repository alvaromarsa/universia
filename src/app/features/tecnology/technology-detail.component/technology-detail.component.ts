import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { AuthService } from 'src/app/core/services/auth.service';
import { FavoriteItem, FavoritesService } from 'src/app/core/services/favorites.service';
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
  private readonly destroyRef = inject(DestroyRef);
  private animationResetTimer: ReturnType<typeof setTimeout> | null = null;
  private navigationTimer: ReturnType<typeof setTimeout> | null = null;
  public allTechnologies: TechnologyInterface[] = [];
  public currentTechnology: TechnologyInterface | null = null;
  public currentIndex = -1;
  public animationClass = '';
  public isFavorite = false;
  private readonly animationDurationMs = 220;
  private pendingEntryClass = '';
  private currentPage: number = 0;
  private currentUserUid: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private technologyService: TechnologyService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private favoritesService: FavoritesService
  ) {
    this.destroyRef.onDestroy(() => this.clearTimers());
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.currentPage = +params['page'] || 0;
      });

    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        this.currentUserUid = user?.uid ?? null;
        this.updateFavoriteState();
      });

    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef),
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
        this.updateFavoriteState();

        if (this.pendingEntryClass) {
          this.animationClass = this.pendingEntryClass;
          this.pendingEntryClass = '';
          this.clearAnimationResetTimer();
          this.animationResetTimer = setTimeout(() => {
            this.animationClass = '';
            this.cdr.markForCheck();
          }, this.animationDurationMs);
        }

        this.cdr.markForCheck();
      })
    ).subscribe();
  }

  goBack(): void {
    this.router.navigate(['/technology'], { queryParams: { page: this.currentPage } });
  }

  goPrev(): void {
    if (this.currentIndex > 0) {
      const prev = this.allTechnologies[this.currentIndex - 1];
      this.navigateWithAnimation(prev.id, 'prev');
    }
  }

  goNext(): void {
    if (this.currentIndex >= 0 && this.currentIndex < this.allTechnologies.length - 1) {
      const next = this.allTechnologies[this.currentIndex + 1];
      this.navigateWithAnimation(next.id, 'next');
    }
  }

  private navigateWithAnimation(id: string, direction: 'prev' | 'next'): void {
    if (this.animationClass) {
      return;
    }

    this.animationClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    this.pendingEntryClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';
    this.cdr.markForCheck();

    this.clearNavigationTimer();
    this.navigationTimer = setTimeout(() => {
      this.router.navigate(['/technology', id]);
    }, this.animationDurationMs);
  }

  private clearTimers(): void {
    this.clearAnimationResetTimer();
    this.clearNavigationTimer();
  }

  private clearAnimationResetTimer(): void {
    if (this.animationResetTimer) {
      clearTimeout(this.animationResetTimer);
      this.animationResetTimer = null;
    }
  }

  private clearNavigationTimer(): void {
    if (this.navigationTimer) {
      clearTimeout(this.navigationTimer);
      this.navigationTimer = null;
    }
  }

  toggleFavorite(): void {
    if (!this.currentTechnology) {
      return;
    }

    if (!this.currentUserUid) {
      this.router.navigate(['/login']);
      return;
    }

    const favoriteItem: FavoriteItem = {
      id: this.currentTechnology.id,
      type: 'technology',
      title: this.currentTechnology.title,
      description: this.currentTechnology.description,
      imageUrl: this.currentTechnology.imageUrl || this.fallbackImage,
    };

    if (this.isFavorite) {
      this.favoritesService.removeFavorite(this.currentUserUid, favoriteItem.id, favoriteItem.type);
    } else {
      this.favoritesService.addFavorite(this.currentUserUid, favoriteItem);
    }

    this.isFavorite = !this.isFavorite;
  }

  private updateFavoriteState(): void {
    if (!this.currentUserUid || !this.currentTechnology) {
      this.isFavorite = false;
      return;
    }

    this.isFavorite = this.favoritesService.isFavorite(
      this.currentUserUid,
      this.currentTechnology.id,
      'technology'
    );
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
