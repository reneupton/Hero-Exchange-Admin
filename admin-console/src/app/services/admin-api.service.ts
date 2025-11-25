import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminConfigService } from './admin-config.service';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private http = inject(HttpClient);
  private config = inject(AdminConfigService);

  get<T>(path: string, params?: any) {
    return this.http.get<T>(`${this.config.apiBase}${path}`, {
      headers: this.config.headers(),
      params,
    });
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(`${this.config.apiBase}${path}`, body, {
      headers: this.config.headers(),
    });
  }

  put<T>(path: string, body: any) {
    return this.http.put<T>(`${this.config.apiBase}${path}`, body, {
      headers: this.config.headers(),
    });
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${this.config.apiBase}${path}`, {
      headers: this.config.headers(),
    });
  }
}
