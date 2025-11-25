import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  error = '';
  message = '';

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.api.get<any[]>('progress/users', { pageSize: 100 }).subscribe({
      next: (res) => {
        this.users = res || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load users';
        this.loading = false;
      },
    });
  }

  adjustBalance(username: string, delta: number) {
    this.api.post(`progress/users/${username}/balance`, { delta }).subscribe({
      next: () => {
        this.showMessage(`Balance updated for ${username}`);
        this.loadUsers();
      },
      error: (err) => (this.error = err.message || 'Failed to update balance'),
    });
  }

  adjustXp(username: string, delta: number) {
    this.api.post(`progress/users/${username}/xp`, { delta }).subscribe({
      next: () => {
        this.showMessage(`XP updated for ${username}`);
        this.loadUsers();
      },
      error: (err) => (this.error = err.message || 'Failed to update XP'),
    });
  }

  resetCooldowns(username: string) {
    this.api.post(`progress/users/${username}/reset-cooldowns`, {}).subscribe({
      next: () => this.showMessage(`Cooldowns reset for ${username}`),
      error: (err) => (this.error = err.message || 'Failed to reset cooldowns'),
    });
  }

  private showMessage(msg: string) {
    this.message = msg;
    setTimeout(() => (this.message = ''), 3000);
  }

  updateAvatar(username: string, avatarUrl: string) {
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
}
