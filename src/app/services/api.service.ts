import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Matter } from '../interfaces/matter';
import { Lesson } from '../interfaces/lesson';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = environment.apiUrl + '/v1/api';
  private readonly API_KEY = environment.key;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-Key': this.API_KEY,
      'Content-Type': 'application/json'
    });
  }

  getMatters(): Observable<Matter[]> {
    return this.http.get<Matter[]>(`${this.API_URL}/view/matters`, {
      headers: this.getHeaders()
    });
  }

  getLessonsByMatter(matterUuid: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.API_URL}/view/lessons/${matterUuid}`, {
      headers: this.getHeaders()
    });
  }
}