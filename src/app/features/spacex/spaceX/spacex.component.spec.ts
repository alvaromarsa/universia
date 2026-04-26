/// <reference types="jasmine" />

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { firstValueFrom, of, Subject, take, throwError, toArray } from 'rxjs';

import { SpacexInterface } from '../spacexInterface';
import { SpacexService } from '../spacexService';
import { SpacexComponent } from './spacex.component';
import { SpacexLaunchListComponent } from './spacex-launch-list.component';

@Component({
  selector: 'app-spacex-launch-list',
  standalone: true,
  template: '',
})
class MockSpacexLaunchListComponent {
  @Input({ required: true }) launches: SpacexInterface[] = [];
  @Output() readonly launchSelected = new EventEmitter<SpacexInterface>();
}

describe('SpacexComponent', () => {
  let spacexService: jasmine.SpyObj<SpacexService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    spacexService = jasmine.createSpyObj<SpacexService>('SpacexService', ['getRecentLaunches']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SpacexComponent],
      providers: [
        { provide: SpacexService, useValue: spacexService },
        { provide: Router, useValue: router },
      ],
    })
      .overrideComponent(SpacexComponent, {
        remove: {
          imports: [SpacexLaunchListComponent],
        },
        add: {
          imports: [MockSpacexLaunchListComponent],
        },
      })
      .compileComponents();
  });

  it('should expose loading first and then the first nine launches on desktop', async () => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1440);
    const launches$ = new Subject<SpacexInterface[]>();
    spacexService.getRecentLaunches.and.returnValue(launches$.asObservable());

    const fixture = TestBed.createComponent(SpacexComponent);
    const statesPromise = firstValueFrom(fixture.componentInstance.launchState$.pipe(take(2), toArray()));

    launches$.next(buildLaunches(12));
    launches$.complete();

    const states = await statesPromise;

    expect(states[0]).toEqual({
      launches: [],
      error: null,
      loading: true,
    });
    expect(states[1].loading).toBeFalse();
    expect(states[1].error).toBeNull();
    expect(states[1].launches.length).toBe(9);
    expect(states[1].launches.map((launch) => launch.id)).toEqual([
      'launch-1',
      'launch-2',
      'launch-3',
      'launch-4',
      'launch-5',
      'launch-6',
      'launch-7',
      'launch-8',
      'launch-9',
    ]);
  });

  it('should keep all launches visible on tablet widths', async () => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(900);
    spacexService.getRecentLaunches.and.returnValue(of(buildLaunches(12)));

    const fixture = TestBed.createComponent(SpacexComponent);
    const state = await firstValueFrom(fixture.componentInstance.launchState$.pipe(take(1)));

    expect(state.loading).toBeFalse();
    expect(state.launches.length).toBe(12);
  });

  it('should expose an error state when the api request fails', async () => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1440);
    spyOn(console, 'error');
    spacexService.getRecentLaunches.and.returnValue(throwError(() => new Error('network error')));

    const fixture = TestBed.createComponent(SpacexComponent);
    const state = await firstValueFrom(fixture.componentInstance.launchState$.pipe(take(1)));

    expect(state).toEqual({
      launches: [],
      error: 'No se pudieron cargar los lanzamientos de SpaceX.',
      loading: false,
    });
    expect(console.error).toHaveBeenCalled();
  });

  it('should pass launches to the child list and navigate when it emits a selection', () => {
    const launches = buildLaunches(2);
    spacexService.getRecentLaunches.and.returnValue(of(launches));

    const fixture = TestBed.createComponent(SpacexComponent);
    fixture.detectChanges();

    const listComponent = fixture.debugElement.query(By.directive(MockSpacexLaunchListComponent))
      .componentInstance as MockSpacexLaunchListComponent;

    expect(listComponent.launches).toEqual(launches);

    listComponent.launchSelected.emit(launches[0]);

    expect(router.navigate).toHaveBeenCalledOnceWith(['/spacex', launches[0].id]);
  });
});

function buildLaunches(total: number): SpacexInterface[] {
  return Array.from({ length: total }, (_, index) => buildLaunch(index + 1));
}

function buildLaunch(index: number): SpacexInterface {
  return {
    id: `launch-${index}`,
    name: `Mission ${index}`,
    details: `Launch details ${index}`,
    date_utc: '2024-01-01T00:00:00.000Z',
    success: true,
    links: {
      patch: {
        small: 'https://example.com/patch.png',
      },
      wikipedia: 'https://example.com/wiki',
      webcast: 'https://example.com/webcast',
    },
    rocket: `rocket-${index}`,
  };
}
