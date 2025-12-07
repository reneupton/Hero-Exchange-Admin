import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BotsComponent } from './bots.component';
import { AdminApiService } from '../../services/admin-api.service';

describe('BotsComponent', () => {
  let component: BotsComponent;
  let fixture: ComponentFixture<BotsComponent>;

  const mockApi = {
    get: jasmine.createSpy('get'),
    post: jasmine.createSpy('post'),
  };

  beforeEach(async () => {
    mockApi.get.calls.reset?.();
    mockApi.post.calls.reset?.();
    mockApi.get.and.callFake((path: string) => {
      if (path === 'bots/status') return of({ running: true, bots: [{ name: 'bot1' }] });
      if (path === 'bots/config') return of({ intervalSeconds: 5 });
      if (path === 'bots/activity') return of({ events: [{ id: 1 }] });
      return of({});
    });
    mockApi.post.and.returnValue(of({ bots: [{ name: 'bot1' }] }));

    await TestBed.configureTestingModule({
      imports: [BotsComponent],
      providers: [{ provide: AdminApiService, useValue: mockApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(BotsComponent);
    component = fixture.componentInstance;
  });

  it('refreshes all bot data on init', () => {
    component.ngOnInit();
    expect(component.running).toBeTrue();
    expect(component.status.length).toBe(1);
    expect(component.configDraft).toEqual({ intervalSeconds: 5 });
    expect(component.activity.length).toBe(1);
  });

  it('starts bots and updates state', () => {
    component.startBots();
    expect(mockApi.post).toHaveBeenCalledWith('bots/start', {});
    expect(component.running).toBeTrue();
  });

  it('stops bots', () => {
    component.stopBots();
    expect(mockApi.post).toHaveBeenCalledWith('bots/stop', {});
    expect(component.running).toBeFalse();
  });

  it('saves configuration', () => {
    component.configDraft = { intervalSeconds: 10 };
    component.saveConfig();
    expect(mockApi.post).toHaveBeenCalledWith('bots/config', { intervalSeconds: 10 });
  });
});
