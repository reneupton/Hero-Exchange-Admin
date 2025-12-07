import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
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
      if (path === 'admin/auctions') {
        return of([
          { status: 'Live', title: 'Test Auction 1', auctionEnd: new Date(), currentHighBid: 100 },
          { status: 'Finished', title: 'Test Auction 2', auctionEnd: new Date(), currentHighBid: 200 },
        ]);
      }
      if (path === 'admin/bots/status') {
        return of({ running: true, bots: [{ name: 'Bot1' }, { name: 'Bot2', lastError: 'boom' }] });
      }
      if (path === 'admin/progress/users') {
        return of([
          { username: 'a', balance: 100, level: 1 },
          { username: 'b', balance: 200, level: 2 },
          { username: 'c', balance: 300, level: 3 },
        ]);
      }
      return of([]);
    });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule],
      providers: [{ provide: AdminApiService, useValue: mockApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('populates cards from API responses', () => {
    component.loadMetrics();
    expect(component.cards[0].value).toBe(1); // active auctions (Live status)
    expect(component.cards[1].value).toBe(3); // users count
    expect(component.cards[2].value).toBe('Running');
    expect(component.cards[3].value).toBe(1); // error bots
    expect(component.lastUpdated).not.toBeNull();
  });

  it('populates recent auctions list', () => {
    component.loadMetrics();
    expect(component.recentAuctions.length).toBe(2);
    expect(component.recentAuctions[0].title).toBeDefined();
  });

  it('populates recent users list', () => {
    component.loadMetrics();
    expect(component.recentUsers.length).toBe(3);
    expect(component.recentUsers[0].username).toBe('c'); // sorted by balance desc
  });

  it('populates bots list', () => {
    component.loadMetrics();
    expect(component.botsList.length).toBe(2);
    expect(component.botsRunning).toBe(true);
  });
});
