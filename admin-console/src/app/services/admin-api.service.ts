import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBase.endsWith('/')
    ? environment.apiBase
    : `${environment.apiBase}/`;

  private adminHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-Admin-Token': environment.adminToken,
    });
  }

  get<T>(path: string, params?: any) {
    return this.http.get<T>(`${this.apiBase}${path}`, {
      headers: this.adminHeaders(),
      params,
    });
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(`${this.apiBase}${path}`, body, {
      headers: this.adminHeaders(),
    });
  }

  put<T>(path: string, body: any) {
    return this.http.put<T>(`${this.apiBase}${path}`, body, {
      headers: this.adminHeaders(),
    });
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${this.apiBase}${path}`, {
      headers: this.adminHeaders(),
    });
  }
}
