import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AuthService } from 'src/app/core/services/auth.service';
import { FavoriteItem, FavoritesService } from 'src/app/core/services/favorites.service';
import { TechnologyTranslatePipe } from '@shared/pipes/technology-translate.pipe';

@Component({
  selector: 'favoritesComponent',
  standalone: true,
  imports: [CommonModule, RouterModule, TechnologyTranslatePipe],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent implements OnInit, OnDestroy {
  private readonly mobileBreakpoint = 640;
  public user: any = null;
  public allFavorites: FavoriteItem[] = [];
  public visibleFavorites$: Observable<FavoriteItem[]> | undefined;
  public currentPage$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public pageSize: number = 4;
  public isMobileView = false;
  private currentUserUid: string | null = null;
  private userSubscription: Subscription | undefined;
  private resizeHandler?: () => void;

  constructor(
    private authService: AuthService,
    private favoritesService: FavoritesService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.syncViewportMode();
      this.resizeHandler = () => this.syncViewportMode();
      window.addEventListener('resize', this.resizeHandler);
    }

    this.route.queryParams.subscribe(params => {
      const page = +params['page'] || 0;
      this.currentPage$.next(page);
    });

    this.userSubscription = this.authService.user$.subscribe(user => {
      console.log('User in favorites:', user);
      Promise.resolve().then(() => {
        this.user = user;
        this.currentUserUid = user?.uid ?? null;
        this.loadFavorites();
        this.cdr.markForCheck();
      });
    });
  }

  private loadFavorites(): void {
    console.log('loadFavorites called, uid:', this.currentUserUid);
    if (!this.currentUserUid) {
      this.allFavorites = [];
      this.visibleFavorites$ = of([]);
      return;
    }

    const data$ = of(this.favoritesService.getFavorites(this.currentUserUid)).pipe(
      tap(data => {
        console.log('Favorites loaded:', data);
        this.allFavorites = data;
        this.cdr.markForCheck();
      })
    );

    this.visibleFavorites$ = combineLatest([data$, this.currentPage$]).pipe(
      map(([data, page]) => {
        if (this.isMobileView) {
          return data;
        }

        const start = page * this.pageSize;
        return data.slice(start, start + this.pageSize);
      })
    );
  }

  private syncViewportMode(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const nextIsMobileView = window.innerWidth <= this.mobileBreakpoint;

    if (nextIsMobileView === this.isMobileView) {
      return;
    }

    this.isMobileView = nextIsMobileView;

    if (this.isMobileView) {
      this.currentPage$.next(0);
    } else {
      this.currentPage$.next(this.currentPage$.value);
    }

    this.cdr.markForCheck();
  }

  nextPage(): void {
    if ((this.currentPage$.value + 1) * this.pageSize < this.allFavorites.length) {
      this.currentPage$.next(this.currentPage$.value + 1);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: this.currentPage$.value }
      });
    }
  }

  prevPage(): void {
    const prev = this.currentPage$.value - 1;
    if (prev >= 0) {
      this.currentPage$.next(prev);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: this.currentPage$.value }
      });
    }
  }

  removeFavorite(item: FavoriteItem): void {
    if (!this.currentUserUid) {
      return;
    }
    this.favoritesService.removeFavorite(this.currentUserUid, item.id, item.type);
    this.loadFavorites();
    setTimeout(() => {
      // Espera a que visibleFavorites$ se actualice
      this.visibleFavorites$?.subscribe(favs => {
        if (favs.length === 0 && this.currentPage$.value > 0) {
          // Retrocede de página y recarga
          const prev = this.currentPage$.value - 1;
          this.currentPage$.next(prev);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page: prev }
          });
          this.loadFavorites();
        }
        this.cdr.markForCheck();
      }).unsubscribe();
    }, 0);
  }

  removeFavoriteSilent(item: FavoriteItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.removeFavorite(item);
  }

  getFavoriteLink(item: FavoriteItem): string {
    return item.type === 'spacex' ? `/spacex/${item.id}` : `/technology/${item.id}`;
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (image) {
      image.src = 'assets/images/fondo.jpg';
    }
  }

  get totalPages(): number {
    if (this.allFavorites.length === 0) {
      return 0;
    }

    if (this.isMobileView) {
      return 1;
    }

    return Math.ceil(this.allFavorites.length / this.pageSize);
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    if (this.resizeHandler && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}
