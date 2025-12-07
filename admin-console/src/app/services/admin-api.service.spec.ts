import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpHeaders } from '@angular/common/http';
import { AdminApiService } from './admin-api.service';
import { AdminConfigService } from './admin-config.service';

describe('AdminApiService', () => {
  let service: AdminApiService;
  let httpMock: HttpTestingController;

  const fakeConfig: Partial<AdminConfigService> = {
    apiBase: 'https://admin.test/api/',
    headers: () => new HttpHeaders({ 'X-Admin-Token': 'secret' }),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AdminConfigService, useValue: fakeConfig }],
    });
    service = TestBed.inject(AdminApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('performs GET with merged base URL, headers, and params', () => {
    service.get<{ running: boolean }>('bots/status', { pageSize: 5 }).subscribe((res) => {
      expect(res.running).toBeTrue();
    });

    const req = httpMock.expectOne('https://admin.test/api/bots/status?pageSize=5');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Admin-Token')).toBe('secret');
    req.flush({ running: true });
  });

  it('performs POST with provided body', () => {
    service.post<{ ok: boolean }>('bots/start', { count: 1 }).subscribe((res) => {
      expect(res.ok).toBeTrue();
    });

    const req = httpMock.expectOne('https://admin.test/api/bots/start');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ count: 1 });
    req.flush({ ok: true });
  });
});
