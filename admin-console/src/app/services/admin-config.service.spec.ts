import { AdminConfigService } from './admin-config.service';
import { environment } from '../../environments/environment';

describe('AdminConfigService', () => {
  beforeEach(() => {
    // reset spies before each instance creation
    (window.localStorage.getItem as any).and?.stub?.();
    (window.localStorage.setItem as any).and?.stub?.();
  });

  it('uses environment defaults when nothing is stored', () => {
    spyOn(window.localStorage, 'getItem').and.returnValue(null);
    const service = new AdminConfigService();

    expect(service.apiBase).toBe(`${environment.apiBase}`);
    expect(service.adminToken).toBe(environment.adminToken);
  });

  it('normalises api base and persists updates', () => {
    spyOn(window.localStorage, 'getItem').and.returnValue(null);
    const setSpy = spyOn(window.localStorage, 'setItem');
    const service = new AdminConfigService();

    service.updateConfig({ apiBase: 'https://example.com/admin', adminToken: 'new-token' });

    expect(service.apiBase).toBe('https://example.com/admin/');
    expect(service.adminToken).toBe('new-token');
    expect(setSpy).toHaveBeenCalled();
    const payload = setSpy.calls.mostRecent().args[1];
    const parsed = JSON.parse(payload);
    expect(parsed.apiBase).toBe('https://example.com/admin/');
    expect(parsed.adminToken).toBe('new-token');
  });

  it('reads and normalises persisted config (including legacy key)', () => {
    const stored = { apiBase: '/api//admin/', adminToken: 'stored-token' };
    const getSpy = spyOn(window.localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'heroexchange-admin-config') return null;
      if (key === 'flogit-admin-config') return JSON.stringify(stored);
      return null;
    });
    const service = new AdminConfigService();

    expect(service.apiBase).toBe('/api/admin/');
    expect(service.adminToken).toBe('stored-token');
    // should have tried new key first, then legacy
    const callOrder = getSpy.calls.allArgs().map((args) => args[0]);
    expect(callOrder[0]).toBe('heroexchange-admin-config');
    expect(callOrder).toContain('flogit-admin-config');
  });
});
