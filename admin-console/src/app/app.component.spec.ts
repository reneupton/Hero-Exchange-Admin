import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app.component';
import { AdminConfigService } from './services/admin-config.service';
import { AdminSignalRService } from './services/admin-signalr.service';

describe('AppComponent', () => {
  const mockConfig = {
    apiBase: 'https://gateway.test/',
    adminToken: 'token',
    updateConfig: jasmine.createSpy('updateConfig'),
  };

  const mockSignalR = {
    connect: jasmine.createSpy('connect'),
    onAuctionStatusChanged: jasmine.createSpy('onAuctionStatusChanged'),
    onUserAvatarUpdated: jasmine.createSpy('onUserAvatarUpdated'),
    onUserProgressAdjusted: jasmine.createSpy('onUserProgressAdjusted'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AdminConfigService, useValue: mockConfig },
        { provide: AdminSignalRService, useValue: mockSignalR },
        provideRouter([], withComponentInputBinding()),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('initialises config form from persisted values', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.configForm.apiBase).toBe(mockConfig.apiBase);
    expect(app.configForm.adminToken).toBe(mockConfig.adminToken);
  });

  it('connects to SignalR and registers handlers on init', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.ngOnInit();
    expect(mockSignalR.connect).toHaveBeenCalled();
    expect(mockSignalR.onAuctionStatusChanged).toHaveBeenCalled();
    expect(mockSignalR.onUserAvatarUpdated).toHaveBeenCalled();
    expect(mockSignalR.onUserProgressAdjusted).toHaveBeenCalled();
  });

  it('saves config via service', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.configForm = { apiBase: 'https://new/', adminToken: 'new-token' };
    app.saveConfig();
    expect(mockConfig.updateConfig).toHaveBeenCalledWith({
      apiBase: 'https://new/',
      adminToken: 'new-token',
    });
  });

  it('renders navigation labels', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Dashboard');
    expect(compiled.textContent).toContain('Users');
    expect(compiled.textContent).toContain('Auctions');
    expect(compiled.textContent).toContain('Bots');
  });
});
