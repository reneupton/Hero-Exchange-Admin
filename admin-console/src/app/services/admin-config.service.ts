import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AdminClientConfig {
  apiBase: string;
  adminToken: string;
}

const STORAGE_KEY = 'flogit-admin-config';

@Injectable({
  providedIn: 'root',
})
export class AdminConfigService {
  private config: AdminClientConfig;

  constructor() {
    const stored = this.readStoredConfig();
    this.config = {
      apiBase: this.normalizeBase(stored?.apiBase || environment.apiBase),
      adminToken: stored?.adminToken || environment.adminToken,
    };
  }

  get apiBase() {
    return this.config.apiBase;
  }

  get adminToken() {
    return this.config.adminToken;
  }

  updateConfig(partial: Partial<AdminClientConfig>) {
    const next: AdminClientConfig = {
      ...this.config,
      ...partial,
    };
    next.apiBase = this.normalizeBase(next.apiBase);
    this.config = next;
    this.persistConfig();
  }

  headers(): HttpHeaders {
    return new HttpHeaders({
      'X-Admin-Token': this.adminToken || '',
    });
  }

  private normalizeBase(base: string) {
    if (!base) return '';
    let value = base.trim();
    // collapse accidental double prefixes like /api/api/ or /admin/admin/
    value = value.replace(/^\/(admin|api)\/(admin|api)\/+/i, '/$1/');
    if (!value.endsWith('/')) {
      value = `${value}/`;
    }
    return value;
  }

  private persistConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // localStorage unavailable (e.g. SSR); ignore persist
    }
  }

  private readStoredConfig(): AdminClientConfig | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AdminClientConfig) : null;
    } catch {
      return null;
    }
  }
}
