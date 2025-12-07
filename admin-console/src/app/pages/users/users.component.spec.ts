import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsersComponent } from './users.component';
import { AdminApiService } from '../../services/admin-api.service';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  const mockApi = {
    get: jasmine.createSpy('get').and.returnValue(
      of([
        { username: 'alice', heroId: null, heroRarity: null },
        { username: 'bob', heroId: 'veyla', heroRarity: 'Rare' },
      ])
    ),
    post: jasmine.createSpy('post').and.returnValue(of({})),
    delete: jasmine.createSpy('delete').and.returnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [{ provide: AdminApiService, useValue: mockApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  it('loads users with defaults for forms', () => {
    component.loadUsers();
    expect(component.users.length).toBe(2);
    expect(component.users[0].heroId).toBeTruthy();
    expect(component.users[0].heroRarity).toBe('Common');
  });

  it('adjusts balance for a user', () => {
    component.adjustBalance('alice', 10);
    expect(mockApi.post).toHaveBeenCalledWith('admin/progress/users/alice/balance', { delta: 10 });
  });

  it('adds and removes heroes', () => {
    component.addHero('alice', 'veyla', 'Rare');
    expect(mockApi.post).toHaveBeenCalledWith('admin/progress/users/alice/heroes', {
      heroId: 'veyla',
      rarity: 'Rare',
    });

    component.removeHero('alice', 'variant123');
    expect(mockApi.delete).toHaveBeenCalledWith('admin/progress/users/alice/heroes/variant123');
  });
});
