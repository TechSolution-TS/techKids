import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ChatRequest } from '../interfaces/lesson';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_URL = environment.apiUrl + '/v1/api';
  private readonly API_KEY = environment.key;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-Key': this.API_KEY,
      'Content-Type': 'application/json'
    });
  }

  sendMessage(request: ChatRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/ia/chat-cliente`, request, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    }).pipe(
      map(response => {
        console.log('Resposta bruta da API:', response);
        
        if (typeof response === 'string') {
          try {
            return JSON.parse(response);
          } catch {
            return { response: response };
          }
        }
        return response;
      })
    );
  }
}