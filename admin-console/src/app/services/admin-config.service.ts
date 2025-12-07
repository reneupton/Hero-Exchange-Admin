// Admin configuration service: stores API base and admin token, persisted in localStorage.
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AdminClientConfig {
  apiBase: string;
  adminToken: string;
}

const STORAGE_KEY = 'heroexchange-admin-config';
const LEGACY_KEYS = ['flogit-admin-config'];

@Injectable({
  providedIn: 'root',
})
export class AdminConfigService {
  private config: AdminClientConfig;

  constructor() {
    const stored = this.readStoredConfig();
    this.config = {
      apiBase: this.normaliseBase(stored?.apiBase || environment.apiBase),
      adminToken: stored?.adminToken || environment.adminToken,
    };
  }

  /** Base URL used by the admin console when calling the Gateway. */
  get apiBase() {
    return this.config.apiBase;
  }

  /** Admin token required by Gateway admin endpoints. */
  get adminToken() {
    return this.config.adminToken;
  }

  /**
   * Updates config and persists to localStorage when available.
   * @param partial New values to merge into existing config.
   */
  updateConfig(partial: Partial<AdminClientConfig>) {
    const next: AdminClientConfig = {
      ...this.config,
      ...partial,
    };
    next.apiBase = this.normaliseBase(next.apiBase);
    this.config = next;
    this.persistConfig();
  }

  headers(): HttpHeaders {
    return new HttpHeaders({
      'X-Admin-Token': this.adminToken || '',
    });
  }

  /**
   * Normalises the base URL to avoid accidental double segments and ensure trailing slash.
   */
  private normaliseBase(base: string) {
    if (!base) return '';
    let value = base.trim();
    const schemeMatch = value.match(/^(https?:)(\/\/.+)$/i);
    if (schemeMatch) {
      const scheme = schemeMatch[1];
      const rest = schemeMatch[2].replace(/\/{2,}/g, '/');
      // maintain double slash after scheme while collapsing subsequent duplicates
      value = `${scheme}//${rest.replace(/^\/+/, '')}`;
    } else {
      // collapse duplicate slashes to keep predictable segments
      value = value.replace(/\/+/g, '/');
    }
    // collapse accidental repeated prefixes like /api/api/ or /admin/admin/
    value = value.replace(/^\/(admin|api)\/\1\/+/i, '/$1/');
    if (!value.endsWith('/')) {
      value = `${value}/`;
    }
    return value;
  }

  /**
   * Reads stored config, checking legacy keys for backward compatibility.
   */
  private readStoredConfig(): AdminClientConfig | null {
    const keysToTry = [STORAGE_KEY, ...LEGACY_KEYS];
    for (const key of keysToTry) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed;
        }
      } catch {
        // ignore invalid JSON / storage issues
      }
    }
    return null;
  }

  private persistConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // localStorage unavailable (e.g. SSR); ignore persist
    }
  }
}
