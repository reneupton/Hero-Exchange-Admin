import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuctionsComponent } from './auctions.component';
import { AdminApiService } from '../../services/admin-api.service';

describe('AuctionsComponent', () => {
  let component: AuctionsComponent;
  let fixture: ComponentFixture<AuctionsComponent>;

  const mockApi = {
    get: jasmine.createSpy('get').and.returnValue(of([{ id: 'abc-123', title: 'Test', status: 'Active' }])),
    post: jasmine.createSpy('post').and.returnValue(of({})),
  };

  beforeEach(async () => {
    mockApi.get.calls.reset?.();
    mockApi.post.calls.reset?.();
    mockApi.get.and.returnValue(of([{ id: 'abc-123', title: 'Test', status: 'Active' }]));
    mockApi.post.and.returnValue(of({}));
    await TestBed.configureTestingModule({
      imports: [AuctionsComponent],
      providers: [{ provide: AdminApiService, useValue: mockApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(AuctionsComponent);
    component = fixture.componentInstance;
  });

  it('loads auctions on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(mockApi.get).toHaveBeenCalledWith('auctions', { pageSize: 50 });
    expect(component.auctions.length).toBe(1);
  }));

  it('filters auctions by search term', () => {
    component.auctions = [
      { id: 'abc-123', title: 'First', status: 'Active' },
      { id: 'def-456', title: 'Second', status: 'Cancelled' },
    ];
    component.searchTerm = 'cancel';
    expect(component.filteredAuctions.length).toBe(1);
    expect(component.filteredAuctions[0].status).toBe('Cancelled');
  });

  it('triggers finish and reloads', () => {
    spyOn(component, 'loadAuctions');
    component.finish('abc');
    expect(mockApi.post).toHaveBeenCalledWith('auctions/abc/finish', {});
    expect(component.loadAuctions).toHaveBeenCalled();
  });

  it('shows error when load fails', () => {
    mockApi.get.and.returnValue(throwError(() => new Error('fail')));
    component.loadAuctions();
    expect(component.error).toContain('fail');
  });
});
