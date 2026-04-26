/// <reference types="jasmine" />

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '@env/environment.development';
import { SpacexInterface } from './spacexInterface';
import { SpacexService } from './spacexService';

describe('SpacexService', () => {
  let service: SpacexService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(SpacexService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request recent launches from the configured api url', () => {
    let result: SpacexInterface[] | undefined;

    service.getRecentLaunches().subscribe((launches) => {
      result = launches;
    });

    const request = httpMock.expectOne(environment.spacexApiUrl);

    expect(request.request.method).toBe('GET');

    request.flush([]);

    expect(result).toEqual([]);
  });

  it('should filter invalid launches, sort by descending date, and keep only the first nine', () => {
    let result: SpacexInterface[] | undefined;

    service.getRecentLaunches().subscribe((launches) => {
      result = launches;
    });

    const request = httpMock.expectOne(environment.spacexApiUrl);

    request.flush([
      buildLaunch('launch-2', '2024-02-01T10:00:00.000Z'),
      buildLaunch('launch-12', '2024-12-01T10:00:00.000Z'),
      buildLaunch('launch-7', '2024-07-01T10:00:00.000Z'),
      buildLaunch('launch-1', '2024-01-01T10:00:00.000Z'),
      buildLaunch('launch-5', '2024-05-01T10:00:00.000Z'),
      buildLaunch('launch-9', '2024-09-01T10:00:00.000Z'),
      buildLaunch('launch-3', '2024-03-01T10:00:00.000Z'),
      buildLaunch('launch-10', '2024-10-01T10:00:00.000Z'),
      buildLaunch('launch-4', '2024-04-01T10:00:00.000Z'),
      buildLaunch('launch-11', '2024-11-01T10:00:00.000Z'),
      buildLaunch('launch-6', '2024-06-01T10:00:00.000Z'),
      buildLaunch('launch-8', '2024-08-01T10:00:00.000Z'),
      buildLaunch('invalid-no-details', '2024-06-15T10:00:00.000Z', { details: null }),
      buildLaunch('invalid-no-patch', '2024-06-16T10:00:00.000Z', {
        links: {
          patch: { small: null },
          wikipedia: 'https://example.com/wiki',
          webcast: 'https://example.com/webcast',
        },
      }),
      buildLaunch('invalid-no-success', '2024-06-17T10:00:00.000Z', { success: null }),
    ]);

    expect(result?.map((launch) => launch.id)).toEqual([
      'launch-12',
      'launch-11',
      'launch-10',
      'launch-9',
      'launch-8',
      'launch-7',
      'launch-6',
      'launch-5',
      'launch-4',
    ]);
  });

  it('should request a launch by id', () => {
    let result: SpacexInterface | undefined;

    service.getLaunchById('launch-42').subscribe((launch) => {
      result = launch;
    });

    const request = httpMock.expectOne(`${environment.spacexApiUrl}/launch-42`);

    expect(request.request.method).toBe('GET');

    request.flush(buildLaunch('launch-42', '2024-04-02T10:00:00.000Z'));

    expect(result?.id).toBe('launch-42');
  });
});

function buildLaunch(
  id: string,
  dateUtc: string,
  overrides: Partial<SpacexInterface> = {}
): SpacexInterface {
  return {
    id,
    name: `Mission ${id}`,
    details: `Details for ${id}`,
    date_utc: dateUtc,
    success: true,
    links: {
      patch: {
        small: 'https://example.com/patch.png',
      },
      wikipedia: 'https://example.com/wiki',
      webcast: 'https://example.com/webcast',
    },
    rocket: 'falcon-9',
    ...overrides,
  };
}
