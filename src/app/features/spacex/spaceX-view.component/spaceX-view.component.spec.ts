/// <reference types="jasmine" />

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, Subject, take, toArray } from 'rxjs';

import { AuthService } from 'src/app/core/services/auth.service';
import { FavoriteItem, FavoritesService } from 'src/app/core/services/favorites.service';
import { SpacexInterface } from '../spacexInterface';
import { SpacexService } from '../spacexService';
import { SpaceXViewComponent } from './spaceX-view.component';
import { SpacexLaunchDetailComponent } from './spacex-launch-detail.component';

@Component({
  selector: 'app-spacex-launch-detail',
  standalone: true,
  template: '',
})
class MockSpacexLaunchDetailComponent {
  @Input({ required: true }) launch!: SpacexInterface;
  @Input({ required: true }) isFavorite = false;
  @Input({ required: true }) launchStatus = '';
  @Input({ required: true }) launchStatusClass = '';

  @Output() readonly favoriteToggled = new EventEmitter<void>();
  @Output() readonly backRequested = new EventEmitter<void>();
}

describe('SpaceXViewComponent', () => {
  let spacexService: jasmine.SpyObj<SpacexService>;
  let favoritesService: jasmine.SpyObj<FavoritesService>;
  let router: jasmine.SpyObj<Router>;
  let authServiceStub: { user$: BehaviorSubject<{ uid: string } | null> };
  let paramMap$: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    spacexService = jasmine.createSpyObj<SpacexService>('SpacexService', ['getLaunchById']);
    favoritesService = jasmine.createSpyObj<FavoritesService>('FavoritesService', [
      'isFavorite',
      'addFavorite',
      'removeFavorite',
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    authServiceStub = {
      user$: new BehaviorSubject<{ uid: string } | null>(null),
    };
    paramMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({ id: 'launch-1' }));

    await TestBed.configureTestingModule({
      imports: [SpaceXViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        { provide: Router, useValue: router },
        { provide: SpacexService, useValue: spacexService },
        { provide: FavoritesService, useValue: favoritesService },
        { provide: AuthService, useValue: authServiceStub },
      ],
    })
      .overrideComponent(SpaceXViewComponent, {
        remove: {
          imports: [SpacexLaunchDetailComponent],
        },
        add: {
          imports: [MockSpacexLaunchDetailComponent],
        },
      })
      .compileComponents();
  });

  it('should expose loading first and then the launch detail with favorite state', async () => {
    const launch$ = new Subject<SpacexInterface>();
    const launch = buildLaunch();

    authServiceStub.user$.next({ uid: 'user-1' });
    favoritesService.isFavorite.and.returnValue(true);
    spacexService.getLaunchById.and.returnValue(launch$.asObservable());

    const fixture = TestBed.createComponent(SpaceXViewComponent);
    const statesPromise = firstValueFrom(fixture.componentInstance.viewModel$.pipe(take(2), toArray()));

    launch$.next(launch);
    launch$.complete();

    const states = await statesPromise;

    expect(states[0]).toEqual({
      launch: null,
      error: null,
      loading: true,
      isFavorite: false,
    });
    expect(states[1]).toEqual({
      launch,
      error: null,
      loading: false,
      isFavorite: true,
    });
    expect(spacexService.getLaunchById).toHaveBeenCalledOnceWith('launch-1');
    expect(favoritesService.isFavorite).toHaveBeenCalledWith('user-1', 'launch-1', 'spacex');
  });

  it('should expose a not found error when the route id is missing', async () => {
    paramMap$.next(convertToParamMap({}));

    const fixture = TestBed.createComponent(SpaceXViewComponent);
    const state = await firstValueFrom(fixture.componentInstance.viewModel$.pipe(take(1)));

    expect(state).toEqual({
      launch: null,
      error: 'No se encontró el lanzamiento solicitado.',
      loading: false,
      isFavorite: false,
    });
    expect(spacexService.getLaunchById).not.toHaveBeenCalled();
  });

  it('should expose an error state when loading the launch fails', async () => {
    const launch$ = new Subject<SpacexInterface>();

    spyOn(console, 'error');
    spacexService.getLaunchById.and.returnValue(launch$.asObservable());

    const fixture = TestBed.createComponent(SpaceXViewComponent);
    const statesPromise = firstValueFrom(fixture.componentInstance.viewModel$.pipe(take(2), toArray()));

    launch$.error(new Error('network error'));

    const states = await statesPromise;

    expect(states[0]).toEqual({
      launch: null,
      error: null,
      loading: true,
      isFavorite: false,
    });
    expect(states[1]).toEqual({
      launch: null,
      error: 'No se pudo cargar el detalle del lanzamiento.',
      loading: false,
      isFavorite: false,
    });
    expect(console.error).toHaveBeenCalled();
  });

  it('should pass launch data to the child and add the launch to favorites when requested', () => {
    const launch = buildLaunch();

    authServiceStub.user$.next({ uid: 'user-1' });
    favoritesService.isFavorite.and.returnValue(false);
    spacexService.getLaunchById.and.returnValue(new BehaviorSubject(launch).asObservable());

    const fixture = TestBed.createComponent(SpaceXViewComponent);
    fixture.detectChanges();

    const child = fixture.debugElement.query(By.directive(MockSpacexLaunchDetailComponent))
      .componentInstance as MockSpacexLaunchDetailComponent;

    expect(child.launch).toEqual(launch);
    expect(child.isFavorite).toBeFalse();
    expect(child.launchStatus).toBe('Exitoso');
    expect(child.launchStatusClass).toBe('status-success');

    child.favoriteToggled.emit();

    expect(favoritesService.addFavorite).toHaveBeenCalledOnceWith('user-1', buildExpectedFavoriteItem(launch));
    expect(favoritesService.removeFavorite).not.toHaveBeenCalled();
  });

  it('should remove the launch from favorites when it is already marked as favorite', () => {
    const launch = buildLaunch();

    authServiceStub.user$.next({ uid: 'user-1' });
    favoritesService.isFavorite.and.returnValue(true);
    spacexService.getLaunchById.and.returnValue(new BehaviorSubject(launch).asObservable());

    const fixture = TestBed.createComponent(SpaceXViewComponent);
    fixture.detectChanges();

    const child = fixture.debugElement.query(By.directive(MockSpacexLaunchDetailComponent))
      .componentInstance as MockSpacexLaunchDetailComponent;

    child.favoriteToggled.emit();

    expect(favoritesService.removeFavorite).toHaveBeenCalledOnceWith('user-1', 'launch-1', 'spacex');
    expect(favoritesService.addFavorite).not.toHaveBeenCalled();
  });

  it('should redirect to login when a guest tries to toggle favorites', () => {
    const launch = buildLaunch();

    favoritesService.isFavorite.and.returnValue(false);
    spacexService.getLaunchById.and.returnValue(new BehaviorSubject(launch).asObservable());

    const fixture = TestBed.createComponent(SpaceXViewComponent);
    fixture.detectChanges();

    const child = fixture.debugElement.query(By.directive(MockSpacexLaunchDetailComponent))
      .componentInstance as MockSpacexLaunchDetailComponent;

    child.favoriteToggled.emit();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(favoritesService.addFavorite).not.toHaveBeenCalled();
    expect(favoritesService.removeFavorite).not.toHaveBeenCalled();
  });

  it('should navigate back to the SpaceX list when requested by the child', () => {
    const launch = buildLaunch();

    spacexService.getLaunchById.and.returnValue(new BehaviorSubject(launch).asObservable());

    const fixture = TestBed.createComponent(SpaceXViewComponent);
    fixture.detectChanges();

    const child = fixture.debugElement.query(By.directive(MockSpacexLaunchDetailComponent))
      .componentInstance as MockSpacexLaunchDetailComponent;

    child.backRequested.emit();

    expect(router.navigate).toHaveBeenCalledWith(['/spacex']);
  });
});

function buildLaunch(): SpacexInterface {
  return {
    id: 'launch-1',
    name: 'Starlink Test Mission',
    details: 'Mission details',
    date_utc: '2024-01-01T00:00:00.000Z',
    success: true,
    links: {
      patch: {
        small: 'https://example.com/patch.png',
      },
      wikipedia: 'https://example.com/wiki',
      webcast: 'https://example.com/webcast',
    },
    rocket: 'falcon-9',
  };
}

function buildExpectedFavoriteItem(launch: SpacexInterface): FavoriteItem {
  return {
    id: launch.id,
    type: 'spacex',
    title: launch.name,
    description: launch.details ?? 'Sin descripción.',
    imageUrl: launch.links.patch.small || 'assets/images/fondo.jpg',
  };
}
