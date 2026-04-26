/// <reference types="jasmine" />

import { PLATFORM_ID } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, take } from 'rxjs';

import { AuthService } from 'src/app/core/services/auth.service';
import { FavoriteItem, FavoritesService } from 'src/app/core/services/favorites.service';
import { FavoritesComponent } from './favorites.component';

describe('FavoritesComponent', () => {
  let authServiceStub: { user$: BehaviorSubject<{ uid: string } | null> };
  let favoritesService: jasmine.SpyObj<FavoritesService>;
  let router: Router;
  let queryParams$: BehaviorSubject<Record<string, unknown>>;

  beforeEach(async () => {
    authServiceStub = {
      user$: new BehaviorSubject<{ uid: string } | null>(null),
    };
    favoritesService = jasmine.createSpyObj<FavoritesService>('FavoritesService', ['getFavorites', 'removeFavorite']);
    queryParams$ = new BehaviorSubject<Record<string, unknown>>({});

    await TestBed.configureTestingModule({
      imports: [FavoritesComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub },
        { provide: FavoritesService, useValue: favoritesService },
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$.asObservable() } },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  it('should show the login state when there is no authenticated user', fakeAsync(() => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1280);

    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(favoritesService.getFavorites).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Debes iniciar sesión para ver y administrar tus favoritos.');
  }));

  it('should load the first desktop page of favorites for the authenticated user', fakeAsync(() => {
    const favorites = buildFavorites(6);

    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1280);
    favoritesService.getFavorites.and.returnValue(favorites);
    authServiceStub.user$.next({ uid: 'user-1' });

    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.favorite-card'));

    expect(favoritesService.getFavorites).toHaveBeenCalledOnceWith('user-1');
    expect(cards.length).toBe(4);
    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(cards.map((card) => card.nativeElement.textContent.trim())).toEqual([
      jasmine.stringContaining('Favorite 1'),
      jasmine.stringContaining('Favorite 2'),
      jasmine.stringContaining('Favorite 3'),
      jasmine.stringContaining('Favorite 4'),
    ]);
  }));

  it('should navigate to the next page on desktop and show the remaining favorites', fakeAsync(() => {
    const favorites = buildFavorites(6);

    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1280);
    favoritesService.getFavorites.and.returnValue(favorites);
    authServiceStub.user$.next({ uid: 'user-1' });

    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();
    tick();
    expect(readVisibleFavorites(fixture.componentInstance)).toEqual(favorites.slice(0, 4));

    fixture.componentInstance.nextPage();
    tick();
    const visibleFavorites = readVisibleFavorites(fixture.componentInstance);

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { page: 1 },
    });
    expect(fixture.componentInstance.currentPage$.value).toBe(1);
    expect(visibleFavorites).toEqual(favorites.slice(4, 6));
  }));

  it('should keep all favorites visible on mobile without pagination', fakeAsync(() => {
    const favorites = buildFavorites(6);

    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(500);
    favoritesService.getFavorites.and.returnValue(favorites);
    authServiceStub.user$.next({ uid: 'user-1' });

    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.favorite-card'));

    expect(fixture.componentInstance.isMobileView).toBeTrue();
    expect(fixture.componentInstance.totalPages).toBe(1);
    expect(cards.length).toBe(6);
    expect(fixture.debugElement.query(By.css('.pagination-nav'))).toBeNull();
  }));

  it('should remove a favorite and go back one page when the current page becomes empty', fakeAsync(() => {
    const firstPageFavorites = buildFavorites(5);
    const itemToRemove = firstPageFavorites[4];
    const afterRemovalFavorites = firstPageFavorites.slice(0, 4);

    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1280);
    queryParams$.next({ page: 1 });
    favoritesService.getFavorites.and.returnValues(firstPageFavorites, afterRemovalFavorites, afterRemovalFavorites);
    authServiceStub.user$.next({ uid: 'user-1' });

    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(readVisibleFavorites(fixture.componentInstance)).toEqual([itemToRemove]);

    fixture.componentInstance.removeFavorite(itemToRemove);
    flush();

    const visibleFavorites = readVisibleFavorites(fixture.componentInstance);

    expect(favoritesService.removeFavorite).toHaveBeenCalledOnceWith('user-1', itemToRemove.id, itemToRemove.type);
    expect(fixture.componentInstance.currentPage$.value).toBe(0);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { page: 0 },
    });
    expect(visibleFavorites).toEqual(afterRemovalFavorites);
  }));
});

function readVisibleFavorites(component: FavoritesComponent): FavoriteItem[] {
  let visibleFavorites: FavoriteItem[] = [];

  component.visibleFavorites$?.pipe(take(1)).subscribe((favorites) => {
    visibleFavorites = favorites;
  });

  return visibleFavorites;
}

function buildFavorites(total: number): FavoriteItem[] {
  return Array.from({ length: total }, (_, index) => ({
    id: `item-${index + 1}`,
    type: index % 2 === 0 ? 'spacex' : 'technology',
    title: `Favorite ${index + 1}`,
    description: `Description ${index + 1}`,
    imageUrl: `https://example.com/${index + 1}.png`,
  }));
}
