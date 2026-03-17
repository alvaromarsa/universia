import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Planeta, PlanetInterface } from '@shared/interfaces/planet.interface';
import { environment } from '@env/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PlanetService {

  constructor(private http:HttpClient) { }

  private readonly API_URL = environment.nasaApiUrl;
  private readonly API_KEY = environment.nasaApiKey;

  private readonly API_URL2 = environment.franceApiUrl;
  private readonly API_KEY2 = environment.franceApiKey;

  private headers = new HttpHeaders({
    'Authorization': `Bearer ${this.API_KEY2}`
   });

  getPlanetsName(): Observable<Planeta[]> {

   const urlFiltered = `${this.API_URL2}?filter[]=isPlanet,eq,true`;

   return this.http.get<PlanetInterface>(urlFiltered, { headers: this.headers }).pipe(
    map(response => response.bodies.map(planet => ({

      id: planet.id || '',
      name: planet.name || 'Sin nombre',
      meanRadius: planet.meanRadius || 0,
    } as Planeta )))
  );
  }

  getPlanetsData(planetId:string): Observable<Planeta[]> {

   const urlFiltered = `${this.API_URL2}?filter[]=isPlanet,eq,true&filter[]=id,eq,${planetId}`;

   return this.http.get<PlanetInterface>(urlFiltered, {headers: this.headers}).pipe(
     map(response => response.bodies.map(planet => ({
      ...planet,
       moons: planet.moons ? planet.moons:null,
     })))
   );

  }

}
