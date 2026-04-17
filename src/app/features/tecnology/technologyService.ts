import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';

import { environment } from '@env/environment.development';
import { NasaResponse, TechnologyInterface } from './technology/technologyInterface';

@Injectable({
  providedIn: 'root'
})

export class TechnologyService {

  constructor( private http: HttpClient ) { }

  private readonly API_URL = environment.nasaTecApiUrl;
  private readonly API_KEY = environment.nasaApiKey;

  private favouritesTec = [ 'MSC-TOPS-90', 'DRC-TOPS-36', 'LAR-TOPS-369', 'MSC-TOPS-74',
                            'MSC-TOPS-85', 'TOP2-106', 'GSC-TOPS-223', 'TOP2-169',
                            'LAR-TOPS-194', 'TOP2-256', 'MSC-TOPS-29', 'MSC-TOPS-96',
                            'LEW-TOPS-99', 'MSC-TOPS-60', 'GSC-TOPS-243', 'TOP2-246',
                        ];


  nasaIndex = {
    id: 1,
    title: 2,
    desc: 3,
    img: 10
  };


  getFavTecnologies(): Observable<TechnologyInterface[]> {
    const petitions = this.favouritesTec.map(id =>
      this.http.get<NasaResponse>(`${this.API_URL}/${id}`).pipe(
        map(response => ({ requestedId: id, response }))
      )
    );

    return forkJoin(petitions).pipe(
      map(responses => {
        return responses.map(({ requestedId, response }) => {
          const data = response.results.find(result => result[this.nasaIndex.id] === requestedId)
            ?? response.results[0];

          if (!data) {
            return {
              id: requestedId,
              title: requestedId,
              description: '',
              imageUrl: ''
            } as TechnologyInterface;
          }

          return {
            id: data[this.nasaIndex.id],
            title: data[this.nasaIndex.title],
            description: data[this.nasaIndex.desc],
            imageUrl: data[this.nasaIndex.img]
          } as TechnologyInterface;
        });
      })
    );
  }
}
