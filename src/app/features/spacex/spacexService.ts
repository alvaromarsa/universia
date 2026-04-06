import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '@env/environment.development';
import { SpacexInterface } from './spacexInterface';

@Injectable({
  providedIn: 'root'
})
export class SpacexService {
  private apiUrl = environment.spacexApiUrl;

  constructor(private http: HttpClient) { }

  getRecentLaunches(): Observable<SpacexInterface[]> {
    return this.http.get<SpacexInterface[]>(this.apiUrl).pipe(
      map(launches => {
        return launches
          .slice()
          .filter((launch) => {
            return Boolean(
              launch.name &&
              launch.date_utc &&
              launch.rocket &&
              launch.links?.patch?.small &&
              launch.details &&
              launch.links?.webcast &&
              launch.success !== null
            );
          })
          .sort((current, next) => {
            const currentDate = new Date(current.date_utc).getTime();
            const nextDate = new Date(next.date_utc).getTime();
            return nextDate - currentDate;
          })
          .slice(0, 9);
      })
    );
  }

  getLaunchById(id: string): Observable<SpacexInterface> {
    return this.http.get<SpacexInterface>(`${this.apiUrl}/${id}`);
  }

}
