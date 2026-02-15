import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Planeta, PlanetInterface } from '../interfaces/planet.interface';
import { environment } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class Petitions {

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
      id: planet.id,
      name: planet.name
    } as Planeta)))
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
