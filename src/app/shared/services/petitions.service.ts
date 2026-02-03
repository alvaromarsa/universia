import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlanetInterface } from '../interfaces/planet.interface';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class Petitions {

  constructor(private http:HttpClient) { }

  private readonly API_URL = 'https://images-api.nasa.gov';
  private readonly API_KEY = '4JQgrsLcpM941ZZX7ALTzNvFGw54b0VudLHvSBaz';

  private readonly API_URL2 = '"url": "https://api.le-systeme-solaire.net/rest/bodies?filter[]=isPlanet,eq,true"';
  private readonly API_KEY2 = '858572d5-d638-4732-a437-88b29092b9a1'


  getPlanets(): Observable<PlanetInterface> {
    const headers = new HttpHeaders({
    'Authorization': `Bearer ${this.API_KEY2}`
   });
    return this.http.get<PlanetInterface>(this.API_URL2, { headers });
  }


}
