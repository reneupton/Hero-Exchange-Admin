// Admin API service: wraps HttpClient with configured base URL and admin token headers.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminConfigService } from './admin-config.service';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private http = inject(HttpClient);
  private config = inject(AdminConfigService);

  /**
   * Performs an authenticated GET request against the admin API.
   * @param path Relative endpoint path (appends to apiBase).
   * @param params Optional query parameters.
   */
  get<T>(path: string, params?: any) {
    return this.http.get<T>(`${this.config.apiBase}${path}`, {
      headers: this.config.headers(),
      params,
    });
  }

  /**
   * Performs an authenticated POST request.
   * @param path Relative endpoint path (appends to apiBase).
   * @param body Request payload.
   */
  post<T>(path: string, body: any) {
    return this.http.post<T>(`${this.config.apiBase}${path}`, body, {
      headers: this.config.headers(),
    });
  }

  /**
   * Performs an authenticated PUT request.
   * @param path Relative endpoint path (appends to apiBase).
   * @param body Request payload.
   */
  put<T>(path: string, body: any) {
    return this.http.put<T>(`${this.config.apiBase}${path}`, body, {
      headers: this.config.headers(),
    });
  }

  /**
   * Performs an authenticated DELETE request.
   * @param path Relative endpoint path (appends to apiBase).
   */
  delete<T>(path: string) {
    return this.http.delete<T>(`${this.config.apiBase}${path}`, {
      headers: this.config.headers(),
    });
  }
}
