import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

type OwnedHero = { name: string; rarity: string; variantId: string };
type AdminUser = {
  username: string;
  flogBalance: number;
  experience?: number;
  totalHeroPower?: number;
  level: number;
  avatarUrl?: string;
  ownedHeroes?: OwnedHero[];
  heroId?: string;
  heroRarity?: string;
  heroRemoveVariant?: string;
};

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})

export class UsersComponent implements OnInit {
  users: AdminUser[] = [];
  loading = false;
  error = '';
  message = '';
  heroOptions = [
    { id: 'veyla', name: 'Veyla (Necromancer)' },
    { id: 'elyra', name: 'Elyra (Oracle)' },
    { id: 'morr', name: 'Morr (Reaper)' },
    { id: 'sigrun', name: 'Sigrun (Valkyrie)' },
    { id: 'caelys', name: 'Caelys (Warrior)' },
    { id: 'torhild', name: 'Torhild (Guardian)' },
    { id: 'frostech', name: 'Frostech (Guardian)' },
    { id: 'grum', name: 'Grum (Berserker)' },
    { id: 'astrael', name: 'Astrael (Reaper)' },
    { id: 'dresh', name: 'Dresh (Ranger)' },
  ];
  rarities = ['Common', 'Rare', 'Epic', 'Legendary'];

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.api.get<any[]>('admin/progress/users', { pageSize: 100 }).subscribe({
      next: (res) => {
        this.users = (res || []).map((u) => ({
          ...u,
          heroId: u.heroId || this.heroOptions[0].id,
          heroRarity: u.heroRarity || 'Common',
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load users';
        this.loading = false;
      },
    });
  }

  adjustBalance(username: string, delta: number) {
    this.api.post(`admin/progress/users/${username}/balance`, { delta }).subscribe({
      next: () => {
        this.showMessage(`Balance updated for ${username}`);
        this.loadUsers();
      },
      error: (err) => (this.error = err.message || 'Failed to update balance'),
    });
  }

  resetCooldowns(username: string) {
    this.api.post(`admin/progress/users/${username}/reset-cooldowns`, {}).subscribe({
      next: () => this.showMessage(`Cooldowns reset for ${username}`),
      error: (err) => (this.error = err.message || 'Failed to reset cooldowns'),
    });
  }

  private showMessage(msg: string) {
    this.message = msg;
    setTimeout(() => (this.message = ''), 3000);
  }

  updateAvatar(username: string, avatarUrl?: string) {
    if (!avatarUrl) {
      this.error = 'Avatar URL required';
      return;
    }
    this.api.post(`admin/progress/users/${username}/avatar`, { avatarUrl }).subscribe({
      next: () => {
        this.showMessage(`Avatar updated for ${username}`);
        this.loadUsers();
      },
      error: (err) => (this.error = err.message || 'Failed to update avatar'),
    });
  }

  addHero(username: string, heroId?: string, rarity?: string) {
    if (!heroId || !rarity) {
      this.error = 'Hero and rarity required';
      return;
    }
    this.api.post(`admin/progress/users/${username}/heroes`, { heroId, rarity }).subscribe({
      next: () => {
        this.showMessage(`Added ${rarity} ${heroId} to ${username}`);
        this.loadUsers();
      },
      error: (err) => (this.error = err.message || 'Failed to add hero'),
    });
  }

  removeHero(username: string, variantId?: string) {
    if (!variantId) {
      this.error = 'VariantId required to remove';
      return;
    }
    this.api.delete(`admin/progress/users/${username}/heroes/${variantId}`).subscribe({
      next: () => {
        this.showMessage(`Removed ${variantId} from ${username}`);
        this.loadUsers();
      },
      error: (err) => (this.error = err.message || 'Failed to remove hero'),
    });
  }
}
