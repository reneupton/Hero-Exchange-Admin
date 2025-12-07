import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AdminApiService } from '../../services/admin-api.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockApi = {
    get: jasmine.createSpy('get'),
  };

  beforeEach(async () => {
    mockApi.get.calls.reset?.();
    mockApi.get.and.callFake((path: string) => {
      if (path === 'auctions') {
        return of([
          { status: 'Active' },
          { status: 'Finished' },
        ]);
      }
      if (path === 'bots/status') {
        return of({ running: true, bots: [{}, { lastError: 'boom' }] });
      }
      if (path === 'admin/progress/users') {
        return of([{ username: 'a' }, { username: 'b' }, { username: 'c' }]);
      }
      return of([]);
    });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: AdminApiService, useValue: mockApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('populates cards from API responses', () => {
    component.loadMetrics();
    expect(component.cards[0].value).toBe(1); // active auctions
    expect(component.cards[1].value).toBe(3); // users count
    expect(component.cards[2].value).toBe('Running');
    expect(component.cards[3].value).toBe(1); // error bots
    expect(component.lastUpdated).not.toBeNull();
  });
});
