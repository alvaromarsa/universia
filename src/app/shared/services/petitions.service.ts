import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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


}
